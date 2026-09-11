-- Fresh databases pass; populated databases must first apply a reviewed V2 mapping.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM startrack.project_create
        WHERE project_id IS NULL OR version_number IS NULL OR version_number < 1) THEN
        RAISE EXCEPTION 'Project history requires an approved complete mapping before finalization';
    END IF;
    IF EXISTS (SELECT project_id FROM startrack.project_create GROUP BY project_id
        HAVING min(version_number) <> 1 OR max(version_number) <> count(*)
        OR count(DISTINCT version_number) <> count(*)) THEN
        RAISE EXCEPTION 'Project history versions must be unique and contiguous from one';
    END IF;
    IF EXISTS (SELECT 1 FROM startrack.project_create) AND NOT EXISTS (
        SELECT 1 FROM startrack.project_history_review r
        WHERE r.approved_manifest->'approved'='true'::jsonb
          AND r.approved_manifest->'formatVersion'='1'::jsonb
          AND r.approved_manifest->>'sourceFingerprint'=r.source_fingerprint
          AND nullif(btrim(r.approved_manifest->>'reviewer'),'') IS NOT NULL
          AND nullif(btrim(r.approved_manifest->>'approvalReference'),'') IS NOT NULL
          AND nullif(r.approved_manifest->>'approvedAt','') IS NOT NULL
          AND (SELECT count(*) FROM jsonb_array_elements(r.approved_manifest->'groups') g
              CROSS JOIN LATERAL jsonb_array_elements_text(g->'versions') v)
              = (SELECT count(*) FROM startrack.project_create)
          AND NOT EXISTS (SELECT 1 FROM startrack.project_create p WHERE NOT EXISTS (
              SELECT 1 FROM jsonb_array_elements(r.approved_manifest->'groups') g
              CROSS JOIN LATERAL jsonb_array_elements_text(g->'versions') WITH ORDINALITY v(id,num)
              WHERE v.id=p.id::text AND (g->>'projectId')::uuid=p.project_id AND v.num=p.version_number))
    ) THEN
        RAISE EXCEPTION 'Populated project history must match one complete approved mapping audit';
    END IF;
END;
$$;

ALTER TABLE startrack.project_create
    ALTER COLUMN project_id SET NOT NULL,
    ALTER COLUMN version_number SET NOT NULL,
    ADD CONSTRAINT project_version_positive CHECK (version_number > 0),
    ADD CONSTRAINT project_version_unique UNIQUE (project_id, version_number);

CREATE FUNCTION startrack.reject_version_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION 'Saved project versions are immutable' USING ERRCODE='23514';
END;
$$;
CREATE TRIGGER immutable_project_version BEFORE UPDATE OR DELETE ON startrack.project_create
FOR EACH ROW EXECUTE FUNCTION startrack.reject_version_mutation();

-- Keep full top-level transaction IDs rather than xmin: xmin wraps at 32 bits
-- and reflects subtransactions. Historical rows intentionally have no entry.
CREATE TABLE startrack.snapshot_creation_ledger (
    entity_kind text NOT NULL,
    row_id bigint NOT NULL,
    creator_xid xid8 NOT NULL,
    PRIMARY KEY (entity_kind,row_id)
);
CREATE FUNCTION startrack.protect_creation_ledger() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP='UPDATE' OR pg_trigger_depth() <> 2 THEN
        RAISE EXCEPTION 'Snapshot creation ledger is trigger-managed' USING ERRCODE='23514';
    END IF;
    IF TG_OP='DELETE' THEN
        IF OLD.creator_xid <> pg_current_xact_id() THEN
            RAISE EXCEPTION 'Only the creating transaction may clear its snapshot ledger' USING ERRCODE='23514';
        END IF;
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;
CREATE TRIGGER protected_creation_ledger BEFORE INSERT OR UPDATE OR DELETE ON startrack.snapshot_creation_ledger
FOR EACH ROW EXECUTE FUNCTION startrack.protect_creation_ledger();
CREATE FUNCTION startrack.record_snapshot_creation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO startrack.snapshot_creation_ledger(entity_kind,row_id,creator_xid)
        VALUES(TG_TABLE_NAME,NEW.id,pg_current_xact_id());
    RETURN NEW;
END;
$$;
CREATE TRIGGER record_project_snapshot AFTER INSERT ON startrack.project_create
FOR EACH ROW EXECUTE FUNCTION startrack.record_snapshot_creation();

-- Entries exist only within the inserting transaction. Deferred cleanup prevents
-- xid reuse after a cross-cluster restore and avoids persistent ledger growth.
CREATE FUNCTION startrack.clear_snapshot_creation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM startrack.snapshot_creation_ledger
        WHERE entity_kind=TG_TABLE_NAME AND row_id=NEW.id AND creator_xid=pg_current_xact_id();
    RETURN NEW;
END;
$$;
CREATE CONSTRAINT TRIGGER clear_project_snapshot AFTER INSERT ON startrack.project_create
DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION startrack.clear_snapshot_creation();

-- Ordinary application statements have no session-flag bypass. A database owner
-- can alter/disable triggers, so this is not a boundary against a malicious DBA.
CREATE FUNCTION startrack.guard_version_link() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
    child_is_new boolean;
    current_xid xid8 := pg_current_xact_id();
BEGIN
    IF TG_OP <> 'INSERT' THEN
        RAISE EXCEPTION 'Saved project version links are immutable' USING ERRCODE='23514';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM startrack.snapshot_creation_ledger
        WHERE entity_kind='project_create' AND row_id=NEW.project_create_id AND creator_xid=current_xid) THEN
        RAISE EXCEPTION 'Links require a project version inserted in this transaction' USING ERRCODE='23514';
    END IF;
    SELECT EXISTS (SELECT 1 FROM startrack.snapshot_creation_ledger
        WHERE entity_kind=TG_ARGV[0] AND row_id=(to_jsonb(NEW)->>TG_ARGV[1])::bigint
        AND creator_xid=current_xid) INTO child_is_new;
    IF NOT child_is_new THEN
        RAISE EXCEPTION 'New versions require newly inserted child snapshots' USING ERRCODE='23514';
    END IF;
    RETURN NEW;
END;
$$;

CREATE FUNCTION startrack.guard_linked_child() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE linked boolean;
BEGIN
    EXECUTE format('SELECT EXISTS (SELECT 1 FROM startrack.%I WHERE %I=$1)', TG_ARGV[0], TG_ARGV[1])
        INTO linked USING OLD.id;
    IF linked THEN
        RAISE EXCEPTION 'Saved project child snapshots are immutable' USING ERRCODE='23514';
    END IF;
    IF TG_OP='DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
END;
$$;

DO $$
DECLARE child text;
BEGIN
    FOREACH child IN ARRAY ARRAY['collaboration_rows','external_advisors_rows','funding_overview_rows',
        'funding_rows','group_member_rows','otr_rows','output_rows','ppi_rows','sub_contractors_rows'] LOOP
        EXECUTE format('CREATE TRIGGER immutable_version_link BEFORE INSERT OR UPDATE OR DELETE ON startrack.%I
            FOR EACH ROW EXECUTE FUNCTION startrack.guard_version_link(%L,%L)',
            'project_create_'||child, child, child||'_id');
        EXECUTE format('CREATE TRIGGER immutable_linked_child BEFORE UPDATE OR DELETE ON startrack.%I
            FOR EACH ROW EXECUTE FUNCTION startrack.guard_linked_child(%L,%L)',
            child, 'project_create_'||child, child||'_id');
        EXECUTE format('CREATE TRIGGER record_child_snapshot AFTER INSERT ON startrack.%I
            FOR EACH ROW EXECUTE FUNCTION startrack.record_snapshot_creation()',child);
        EXECUTE format('CREATE CONSTRAINT TRIGGER clear_child_snapshot AFTER INSERT ON startrack.%I
            DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION startrack.clear_snapshot_creation()',child);
    END LOOP;
END;
$$;
