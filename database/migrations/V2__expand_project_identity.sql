-- Expansion deliberately leaves legacy versions unmapped until explicit review.
CREATE TABLE startrack.project (
    id uuid PRIMARY KEY,
    archived boolean NOT NULL DEFAULT false,
    archived_at timestamp without time zone,
    archived_by bigint REFERENCES startrack."user"(id),
    created_by bigint REFERENCES startrack."user"(id),
    created_at timestamp without time zone NOT NULL
);

ALTER TABLE startrack.project_create
    ADD COLUMN project_id uuid REFERENCES startrack.project(id),
    ADD COLUMN version_number integer,
    ADD COLUMN created_by bigint REFERENCES startrack."user"(id),
    ADD COLUMN modified_by bigint REFERENCES startrack."user"(id);

UPDATE startrack.project_create p SET created_by=u.id
FROM startrack."user" u WHERE p.apply_user=u.email;
UPDATE startrack.project_create p SET modified_by=u.id
FROM startrack."user" u WHERE p.modify_user=u.email;

-- Original email strings remain historical snapshots, not mutable foreign keys.
ALTER TABLE startrack.project_create
    DROP CONSTRAINT fkk0pcu363i9enx2uvovr6xdgf1,
    DROP CONSTRAINT fk4g4onfptf209so2f47xnhskoq;

CREATE TABLE startrack.project_history_review (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    source_fingerprint varchar(64) NOT NULL,
    approved_manifest jsonb NOT NULL,
    applied_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
