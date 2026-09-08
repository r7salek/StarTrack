-- Observed local schema, 2026-09-07; PostgreSQL 15.19.
-- Source baseline: 974d07b (Phase 2); schema-only capture, no application data.
-- Evidence for Phase 3 review, NOT an approved migration or a data backup.
-- Includes public objects because a generated-ID sequence lives there.
-- No automatic application of this file is configured.

--
-- PostgreSQL database dump
--


-- Dumped from database version 15.19
-- Dumped by pg_dump version 15.19

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: startrack; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA startrack;


--
-- Name: seq_name_generated_in_db; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_name_generated_in_db
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: collaboration_rows; Type: TABLE; Schema: startrack; Owner: -
--

CREATE TABLE startrack.collaboration_rows (
    id integer NOT NULL,
    collaboration character varying(255),
    collaboration_email character varying(255),
    collaboration_location character varying(255),
    collaboration_name character varying(255),
    collaboration_other_info character varying(255)
);


--
-- Name: collaboration_rows_id_seq; Type: SEQUENCE; Schema: startrack; Owner: -
--

CREATE SEQUENCE startrack.collaboration_rows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: collaboration_rows_id_seq; Type: SEQUENCE OWNED BY; Schema: startrack; Owner: -
--

ALTER SEQUENCE startrack.collaboration_rows_id_seq OWNED BY startrack.collaboration_rows.id;


--
-- Name: external_advisors_rows; Type: TABLE; Schema: startrack; Owner: -
--

CREATE TABLE startrack.external_advisors_rows (
    id integer NOT NULL,
    external_advisors_email character varying(255),
    external_advisors_expertise character varying(255),
    external_advisors_meeting timestamp without time zone,
    external_advisors_name character varying(255),
    external_advisors_organisation character varying(255),
    external_advisors_outcome character varying(255)
);


--
-- Name: external_advisors_rows_id_seq; Type: SEQUENCE; Schema: startrack; Owner: -
--

CREATE SEQUENCE startrack.external_advisors_rows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: external_advisors_rows_id_seq; Type: SEQUENCE OWNED BY; Schema: startrack; Owner: -
--

ALTER SEQUENCE startrack.external_advisors_rows_id_seq OWNED BY startrack.external_advisors_rows.id;


--
-- Name: funding_overview_rows; Type: TABLE; Schema: startrack; Owner: -
--

CREATE TABLE startrack.funding_overview_rows (
    id integer NOT NULL,
    aims_overview text,
    funding_overview character varying(255),
    funding_overview_end_date timestamp without time zone,
    funding_overviewnihr character varying(255),
    funding_overviewnihrother character varying(255),
    funding_overview_other character varying(255),
    funding_overview_start_date timestamp without time zone,
    funding_overviewukrimrc character varying(255),
    funding_overviewukrimrcother character varying(255),
    funding_overview_wellcome_trust character varying(255),
    funding_overview_wellcome_trust_other character varying(255),
    grant_number_overview character varying(255),
    scheme_overview character varying(255),
    scheme_overview_other character varying(255),
    value_overview integer,
    worktribe_number_overview character varying(255)
);


--
-- Name: funding_overview_rows_id_seq; Type: SEQUENCE; Schema: startrack; Owner: -
--

CREATE SEQUENCE startrack.funding_overview_rows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: funding_overview_rows_id_seq; Type: SEQUENCE OWNED BY; Schema: startrack; Owner: -
--

ALTER SEQUENCE startrack.funding_overview_rows_id_seq OWNED BY startrack.funding_overview_rows.id;


--
-- Name: funding_rows; Type: TABLE; Schema: startrack; Owner: -
--

CREATE TABLE startrack.funding_rows (
    id integer NOT NULL,
    aims text,
    funding character varying(255),
    funding_end_date timestamp without time zone,
    fundingnihr character varying(255),
    fundingnihrother character varying(255),
    funding_other character varying(255),
    funding_start_date timestamp without time zone,
    fundingukrimrc character varying(255),
    fundingukrimrcother character varying(255),
    funding_wellcome_trust character varying(255),
    funding_wellcome_trust_other character varying(255),
    grant_number character varying(255),
    scheme character varying(255),
    scheme_other character varying(255),
    value integer,
    worktribe_number character varying(255)
);


--
-- Name: funding_rows_id_seq; Type: SEQUENCE; Schema: startrack; Owner: -
--

CREATE SEQUENCE startrack.funding_rows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: funding_rows_id_seq; Type: SEQUENCE OWNED BY; Schema: startrack; Owner: -
--

ALTER SEQUENCE startrack.funding_rows_id_seq OWNED BY startrack.funding_rows.id;


--
-- Name: group_member_rows; Type: TABLE; Schema: startrack; Owner: -
--

CREATE TABLE startrack.group_member_rows (
    id integer NOT NULL,
    crsid_post_doc character varying(255),
    department_post_doc character varying(255),
    email_post_doc character varying(255),
    first_name_post_doc character varying(255),
    last_name_post_doc character varying(255),
    other_infor_post_doc character varying(255),
    position_post_doc character varying(255)
);


--
-- Name: group_member_rows_id_seq; Type: SEQUENCE; Schema: startrack; Owner: -
--

CREATE SEQUENCE startrack.group_member_rows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: group_member_rows_id_seq; Type: SEQUENCE OWNED BY; Schema: startrack; Owner: -
--

ALTER SEQUENCE startrack.group_member_rows_id_seq OWNED BY startrack.group_member_rows.id;


--
-- Name: otr_rows; Type: TABLE; Schema: startrack; Owner: -
--

CREATE TABLE startrack.otr_rows (
    id integer NOT NULL,
    otr_date timestamp without time zone,
    otr_funding character varying(255),
    otr_other_info character varying(255),
    otr_role character varying(255),
    otr_team_member character varying(255)
);


--
-- Name: otr_rows_id_seq; Type: SEQUENCE; Schema: startrack; Owner: -
--

CREATE SEQUENCE startrack.otr_rows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: otr_rows_id_seq; Type: SEQUENCE OWNED BY; Schema: startrack; Owner: -
--

ALTER SEQUENCE startrack.otr_rows_id_seq OWNED BY startrack.otr_rows.id;


--
-- Name: output_rows; Type: TABLE; Schema: startrack; Owner: -
--

CREATE TABLE startrack.output_rows (
    id integer NOT NULL,
    confirmation character varying(255),
    output character varying(255),
    output_quantity bigint,
    output_description text
);


--
-- Name: output_rows_id_seq; Type: SEQUENCE; Schema: startrack; Owner: -
--

CREATE SEQUENCE startrack.output_rows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: output_rows_id_seq; Type: SEQUENCE OWNED BY; Schema: startrack; Owner: -
--

ALTER SEQUENCE startrack.output_rows_id_seq OWNED BY startrack.output_rows.id;


--
-- Name: ppi_rows; Type: TABLE; Schema: startrack; Owner: -
--

CREATE TABLE startrack.ppi_rows (
    id integer NOT NULL,
    ppi_contact character varying(255),
    ppi_group character varying(255),
    ppi_meeting timestamp without time zone,
    ppi_outcome character varying(255)
);


--
-- Name: ppi_rows_id_seq; Type: SEQUENCE; Schema: startrack; Owner: -
--

CREATE SEQUENCE startrack.ppi_rows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ppi_rows_id_seq; Type: SEQUENCE OWNED BY; Schema: startrack; Owner: -
--

ALTER SEQUENCE startrack.ppi_rows_id_seq OWNED BY startrack.ppi_rows.id;


--
-- Name: project_create; Type: TABLE; Schema: startrack; Owner: -
--

CREATE TABLE startrack.project_create (
    id bigint NOT NULL,
    apply_value character varying(255),
    area_of_expertise character varying(255),
    area_of_expertise_other character varying(255),
    brief_description text,
    created_date timestamp without time zone,
    crsidpi character varying(255),
    departmentpi character varying(255),
    emailpi character varying(255),
    first_namepi character varying(255),
    last_namepi character varying(255),
    modality character varying(255),
    modality_other character varying(255),
    other_inforpi character varying(255),
    project_background text,
    project_name character varying(255),
    readiness character varying(255),
    tto_contract_email character varying(255),
    tto_contract_name character varying(255),
    tto_contract_other_info character varying(255),
    apply_user character varying(255),
    modify_user character varying(255)
);


--
-- Name: project_create_collaboration_rows; Type: TABLE; Schema: startrack; Owner: -
--

CREATE TABLE startrack.project_create_collaboration_rows (
    project_create_id bigint NOT NULL,
    collaboration_rows_id integer NOT NULL
);


--
-- Name: project_create_collaboration_rows_collaboration_rows_id_seq; Type: SEQUENCE; Schema: startrack; Owner: -
--

CREATE SEQUENCE startrack.project_create_collaboration_rows_collaboration_rows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_create_collaboration_rows_collaboration_rows_id_seq; Type: SEQUENCE OWNED BY; Schema: startrack; Owner: -
--

ALTER SEQUENCE startrack.project_create_collaboration_rows_collaboration_rows_id_seq OWNED BY startrack.project_create_collaboration_rows.collaboration_rows_id;


--
-- Name: project_create_external_advisors_rows; Type: TABLE; Schema: startrack; Owner: -
--

CREATE TABLE startrack.project_create_external_advisors_rows (
    project_create_id bigint NOT NULL,
    external_advisors_rows_id integer NOT NULL
);


--
-- Name: project_create_external_advisors__external_advisors_rows_id_seq; Type: SEQUENCE; Schema: startrack; Owner: -
--

CREATE SEQUENCE startrack.project_create_external_advisors__external_advisors_rows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_create_external_advisors__external_advisors_rows_id_seq; Type: SEQUENCE OWNED BY; Schema: startrack; Owner: -
--

ALTER SEQUENCE startrack.project_create_external_advisors__external_advisors_rows_id_seq OWNED BY startrack.project_create_external_advisors_rows.external_advisors_rows_id;


--
-- Name: project_create_funding_overview_rows; Type: TABLE; Schema: startrack; Owner: -
--

CREATE TABLE startrack.project_create_funding_overview_rows (
    project_create_id bigint NOT NULL,
    funding_overview_rows_id integer NOT NULL
);


--
-- Name: project_create_funding_overview_ro_funding_overview_rows_id_seq; Type: SEQUENCE; Schema: startrack; Owner: -
--

CREATE SEQUENCE startrack.project_create_funding_overview_ro_funding_overview_rows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_create_funding_overview_ro_funding_overview_rows_id_seq; Type: SEQUENCE OWNED BY; Schema: startrack; Owner: -
--

ALTER SEQUENCE startrack.project_create_funding_overview_ro_funding_overview_rows_id_seq OWNED BY startrack.project_create_funding_overview_rows.funding_overview_rows_id;


--
-- Name: project_create_funding_rows; Type: TABLE; Schema: startrack; Owner: -
--

CREATE TABLE startrack.project_create_funding_rows (
    project_create_id bigint NOT NULL,
    funding_rows_id integer NOT NULL
);


--
-- Name: project_create_funding_rows_funding_rows_id_seq; Type: SEQUENCE; Schema: startrack; Owner: -
--

CREATE SEQUENCE startrack.project_create_funding_rows_funding_rows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_create_funding_rows_funding_rows_id_seq; Type: SEQUENCE OWNED BY; Schema: startrack; Owner: -
--

ALTER SEQUENCE startrack.project_create_funding_rows_funding_rows_id_seq OWNED BY startrack.project_create_funding_rows.funding_rows_id;


--
-- Name: project_create_group_member_rows; Type: TABLE; Schema: startrack; Owner: -
--

CREATE TABLE startrack.project_create_group_member_rows (
    project_create_id bigint NOT NULL,
    group_member_rows_id integer NOT NULL
);


--
-- Name: project_create_group_member_rows_group_member_rows_id_seq; Type: SEQUENCE; Schema: startrack; Owner: -
--

CREATE SEQUENCE startrack.project_create_group_member_rows_group_member_rows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_create_group_member_rows_group_member_rows_id_seq; Type: SEQUENCE OWNED BY; Schema: startrack; Owner: -
--

ALTER SEQUENCE startrack.project_create_group_member_rows_group_member_rows_id_seq OWNED BY startrack.project_create_group_member_rows.group_member_rows_id;


--
-- Name: project_create_id_seq; Type: SEQUENCE; Schema: startrack; Owner: -
--

CREATE SEQUENCE startrack.project_create_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_create_id_seq; Type: SEQUENCE OWNED BY; Schema: startrack; Owner: -
--

ALTER SEQUENCE startrack.project_create_id_seq OWNED BY startrack.project_create.id;


--
-- Name: project_create_otr_rows; Type: TABLE; Schema: startrack; Owner: -
--

CREATE TABLE startrack.project_create_otr_rows (
    project_create_id bigint NOT NULL,
    otr_rows_id integer NOT NULL
);


--
-- Name: project_create_otr_rows_otr_rows_id_seq; Type: SEQUENCE; Schema: startrack; Owner: -
--

CREATE SEQUENCE startrack.project_create_otr_rows_otr_rows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_create_otr_rows_otr_rows_id_seq; Type: SEQUENCE OWNED BY; Schema: startrack; Owner: -
--

ALTER SEQUENCE startrack.project_create_otr_rows_otr_rows_id_seq OWNED BY startrack.project_create_otr_rows.otr_rows_id;


--
-- Name: project_create_output_rows; Type: TABLE; Schema: startrack; Owner: -
--

CREATE TABLE startrack.project_create_output_rows (
    project_create_id bigint NOT NULL,
    output_rows_id integer NOT NULL
);


--
-- Name: project_create_output_rows_output_rows_id_seq; Type: SEQUENCE; Schema: startrack; Owner: -
--

CREATE SEQUENCE startrack.project_create_output_rows_output_rows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_create_output_rows_output_rows_id_seq; Type: SEQUENCE OWNED BY; Schema: startrack; Owner: -
--

ALTER SEQUENCE startrack.project_create_output_rows_output_rows_id_seq OWNED BY startrack.project_create_output_rows.output_rows_id;


--
-- Name: project_create_ppi_rows; Type: TABLE; Schema: startrack; Owner: -
--

CREATE TABLE startrack.project_create_ppi_rows (
    project_create_id bigint NOT NULL,
    ppi_rows_id integer NOT NULL
);


--
-- Name: project_create_ppi_rows_ppi_rows_id_seq; Type: SEQUENCE; Schema: startrack; Owner: -
--

CREATE SEQUENCE startrack.project_create_ppi_rows_ppi_rows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_create_ppi_rows_ppi_rows_id_seq; Type: SEQUENCE OWNED BY; Schema: startrack; Owner: -
--

ALTER SEQUENCE startrack.project_create_ppi_rows_ppi_rows_id_seq OWNED BY startrack.project_create_ppi_rows.ppi_rows_id;


--
-- Name: project_create_sub_contractors_rows; Type: TABLE; Schema: startrack; Owner: -
--

CREATE TABLE startrack.project_create_sub_contractors_rows (
    project_create_id bigint NOT NULL,
    sub_contractors_rows_id integer NOT NULL
);


--
-- Name: project_create_sub_contractors_rows_sub_contractors_rows_id_seq; Type: SEQUENCE; Schema: startrack; Owner: -
--

CREATE SEQUENCE startrack.project_create_sub_contractors_rows_sub_contractors_rows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_create_sub_contractors_rows_sub_contractors_rows_id_seq; Type: SEQUENCE OWNED BY; Schema: startrack; Owner: -
--

ALTER SEQUENCE startrack.project_create_sub_contractors_rows_sub_contractors_rows_id_seq OWNED BY startrack.project_create_sub_contractors_rows.sub_contractors_rows_id;


--
-- Name: roles; Type: TABLE; Schema: startrack; Owner: -
--

CREATE TABLE startrack.roles (
    id bigint NOT NULL,
    name character varying(255)
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: startrack; Owner: -
--

CREATE SEQUENCE startrack.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: startrack; Owner: -
--

ALTER SEQUENCE startrack.roles_id_seq OWNED BY startrack.roles.id;


--
-- Name: sub_contractors_rows; Type: TABLE; Schema: startrack; Owner: -
--

CREATE TABLE startrack.sub_contractors_rows (
    id integer NOT NULL,
    sub_contractors_email character varying(255),
    sub_contractors_expertise character varying(255),
    sub_contractors_name character varying(255),
    sub_contractors_organisation character varying(255),
    sub_contractors_other_info character varying(255)
);


--
-- Name: sub_contractors_rows_id_seq; Type: SEQUENCE; Schema: startrack; Owner: -
--

CREATE SEQUENCE startrack.sub_contractors_rows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sub_contractors_rows_id_seq; Type: SEQUENCE OWNED BY; Schema: startrack; Owner: -
--

ALTER SEQUENCE startrack.sub_contractors_rows_id_seq OWNED BY startrack.sub_contractors_rows.id;


--
-- Name: user; Type: TABLE; Schema: startrack; Owner: -
--

CREATE TABLE startrack."user" (
    id bigint NOT NULL,
    created_date timestamp without time zone,
    delete boolean,
    email character varying(255),
    enabled boolean,
    first_name character varying(255),
    last_name character varying(255),
    modified_date timestamp without time zone,
    password character varying(255),
    provider character varying(255),
    provider_user_id character varying(255)
);


--
-- Name: user_id_seq; Type: SEQUENCE; Schema: startrack; Owner: -
--

CREATE SEQUENCE startrack.user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: startrack; Owner: -
--

ALTER SEQUENCE startrack.user_id_seq OWNED BY startrack."user".id;


--
-- Name: user_roles; Type: TABLE; Schema: startrack; Owner: -
--

CREATE TABLE startrack.user_roles (
    user_id bigint NOT NULL,
    role_id bigint NOT NULL
);


--
-- Name: collaboration_rows id; Type: DEFAULT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.collaboration_rows ALTER COLUMN id SET DEFAULT nextval('startrack.collaboration_rows_id_seq'::regclass);


--
-- Name: external_advisors_rows id; Type: DEFAULT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.external_advisors_rows ALTER COLUMN id SET DEFAULT nextval('startrack.external_advisors_rows_id_seq'::regclass);


--
-- Name: funding_overview_rows id; Type: DEFAULT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.funding_overview_rows ALTER COLUMN id SET DEFAULT nextval('startrack.funding_overview_rows_id_seq'::regclass);


--
-- Name: funding_rows id; Type: DEFAULT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.funding_rows ALTER COLUMN id SET DEFAULT nextval('startrack.funding_rows_id_seq'::regclass);


--
-- Name: group_member_rows id; Type: DEFAULT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.group_member_rows ALTER COLUMN id SET DEFAULT nextval('startrack.group_member_rows_id_seq'::regclass);


--
-- Name: otr_rows id; Type: DEFAULT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.otr_rows ALTER COLUMN id SET DEFAULT nextval('startrack.otr_rows_id_seq'::regclass);


--
-- Name: output_rows id; Type: DEFAULT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.output_rows ALTER COLUMN id SET DEFAULT nextval('startrack.output_rows_id_seq'::regclass);


--
-- Name: ppi_rows id; Type: DEFAULT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.ppi_rows ALTER COLUMN id SET DEFAULT nextval('startrack.ppi_rows_id_seq'::regclass);


--
-- Name: project_create id; Type: DEFAULT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create ALTER COLUMN id SET DEFAULT nextval('startrack.project_create_id_seq'::regclass);


--
-- Name: project_create_collaboration_rows collaboration_rows_id; Type: DEFAULT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_collaboration_rows ALTER COLUMN collaboration_rows_id SET DEFAULT nextval('startrack.project_create_collaboration_rows_collaboration_rows_id_seq'::regclass);


--
-- Name: project_create_external_advisors_rows external_advisors_rows_id; Type: DEFAULT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_external_advisors_rows ALTER COLUMN external_advisors_rows_id SET DEFAULT nextval('startrack.project_create_external_advisors__external_advisors_rows_id_seq'::regclass);


--
-- Name: project_create_funding_overview_rows funding_overview_rows_id; Type: DEFAULT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_funding_overview_rows ALTER COLUMN funding_overview_rows_id SET DEFAULT nextval('startrack.project_create_funding_overview_ro_funding_overview_rows_id_seq'::regclass);


--
-- Name: project_create_funding_rows funding_rows_id; Type: DEFAULT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_funding_rows ALTER COLUMN funding_rows_id SET DEFAULT nextval('startrack.project_create_funding_rows_funding_rows_id_seq'::regclass);


--
-- Name: project_create_group_member_rows group_member_rows_id; Type: DEFAULT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_group_member_rows ALTER COLUMN group_member_rows_id SET DEFAULT nextval('startrack.project_create_group_member_rows_group_member_rows_id_seq'::regclass);


--
-- Name: project_create_otr_rows otr_rows_id; Type: DEFAULT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_otr_rows ALTER COLUMN otr_rows_id SET DEFAULT nextval('startrack.project_create_otr_rows_otr_rows_id_seq'::regclass);


--
-- Name: project_create_output_rows output_rows_id; Type: DEFAULT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_output_rows ALTER COLUMN output_rows_id SET DEFAULT nextval('startrack.project_create_output_rows_output_rows_id_seq'::regclass);


--
-- Name: project_create_ppi_rows ppi_rows_id; Type: DEFAULT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_ppi_rows ALTER COLUMN ppi_rows_id SET DEFAULT nextval('startrack.project_create_ppi_rows_ppi_rows_id_seq'::regclass);


--
-- Name: project_create_sub_contractors_rows sub_contractors_rows_id; Type: DEFAULT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_sub_contractors_rows ALTER COLUMN sub_contractors_rows_id SET DEFAULT nextval('startrack.project_create_sub_contractors_rows_sub_contractors_rows_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.roles ALTER COLUMN id SET DEFAULT nextval('startrack.roles_id_seq'::regclass);


--
-- Name: sub_contractors_rows id; Type: DEFAULT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.sub_contractors_rows ALTER COLUMN id SET DEFAULT nextval('startrack.sub_contractors_rows_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack."user" ALTER COLUMN id SET DEFAULT nextval('startrack.user_id_seq'::regclass);


--
-- Name: collaboration_rows collaboration_rows_pkey; Type: CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.collaboration_rows
    ADD CONSTRAINT collaboration_rows_pkey PRIMARY KEY (id);


--
-- Name: external_advisors_rows external_advisors_rows_pkey; Type: CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.external_advisors_rows
    ADD CONSTRAINT external_advisors_rows_pkey PRIMARY KEY (id);


--
-- Name: funding_overview_rows funding_overview_rows_pkey; Type: CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.funding_overview_rows
    ADD CONSTRAINT funding_overview_rows_pkey PRIMARY KEY (id);


--
-- Name: funding_rows funding_rows_pkey; Type: CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.funding_rows
    ADD CONSTRAINT funding_rows_pkey PRIMARY KEY (id);


--
-- Name: group_member_rows group_member_rows_pkey; Type: CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.group_member_rows
    ADD CONSTRAINT group_member_rows_pkey PRIMARY KEY (id);


--
-- Name: otr_rows otr_rows_pkey; Type: CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.otr_rows
    ADD CONSTRAINT otr_rows_pkey PRIMARY KEY (id);


--
-- Name: output_rows output_rows_pkey; Type: CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.output_rows
    ADD CONSTRAINT output_rows_pkey PRIMARY KEY (id);


--
-- Name: ppi_rows ppi_rows_pkey; Type: CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.ppi_rows
    ADD CONSTRAINT ppi_rows_pkey PRIMARY KEY (id);


--
-- Name: project_create_collaboration_rows project_create_collaboration_rows_pkey; Type: CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_collaboration_rows
    ADD CONSTRAINT project_create_collaboration_rows_pkey PRIMARY KEY (project_create_id, collaboration_rows_id);


--
-- Name: project_create_external_advisors_rows project_create_external_advisors_rows_pkey; Type: CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_external_advisors_rows
    ADD CONSTRAINT project_create_external_advisors_rows_pkey PRIMARY KEY (project_create_id, external_advisors_rows_id);


--
-- Name: project_create_funding_overview_rows project_create_funding_overview_rows_pkey; Type: CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_funding_overview_rows
    ADD CONSTRAINT project_create_funding_overview_rows_pkey PRIMARY KEY (project_create_id, funding_overview_rows_id);


--
-- Name: project_create_funding_rows project_create_funding_rows_pkey; Type: CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_funding_rows
    ADD CONSTRAINT project_create_funding_rows_pkey PRIMARY KEY (project_create_id, funding_rows_id);


--
-- Name: project_create_group_member_rows project_create_group_member_rows_pkey; Type: CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_group_member_rows
    ADD CONSTRAINT project_create_group_member_rows_pkey PRIMARY KEY (project_create_id, group_member_rows_id);


--
-- Name: project_create_otr_rows project_create_otr_rows_pkey; Type: CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_otr_rows
    ADD CONSTRAINT project_create_otr_rows_pkey PRIMARY KEY (project_create_id, otr_rows_id);


--
-- Name: project_create_output_rows project_create_output_rows_pkey; Type: CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_output_rows
    ADD CONSTRAINT project_create_output_rows_pkey PRIMARY KEY (project_create_id, output_rows_id);


--
-- Name: project_create project_create_pkey; Type: CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create
    ADD CONSTRAINT project_create_pkey PRIMARY KEY (id);


--
-- Name: project_create_ppi_rows project_create_ppi_rows_pkey; Type: CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_ppi_rows
    ADD CONSTRAINT project_create_ppi_rows_pkey PRIMARY KEY (project_create_id, ppi_rows_id);


--
-- Name: project_create_sub_contractors_rows project_create_sub_contractors_rows_pkey; Type: CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_sub_contractors_rows
    ADD CONSTRAINT project_create_sub_contractors_rows_pkey PRIMARY KEY (project_create_id, sub_contractors_rows_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sub_contractors_rows sub_contractors_rows_pkey; Type: CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.sub_contractors_rows
    ADD CONSTRAINT sub_contractors_rows_pkey PRIMARY KEY (id);


--
-- Name: user uk_ob8kqyqqgmefl0aco34akdtpe; Type: CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack."user"
    ADD CONSTRAINT uk_ob8kqyqqgmefl0aco34akdtpe UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: project_create_external_advisors_rows fk1gr293jfywdn14ook7aflwhgc; Type: FK CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_external_advisors_rows
    ADD CONSTRAINT fk1gr293jfywdn14ook7aflwhgc FOREIGN KEY (project_create_id) REFERENCES startrack.project_create(id);


--
-- Name: project_create_external_advisors_rows fk1m6jvvic23pbncriwaqsotamf; Type: FK CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_external_advisors_rows
    ADD CONSTRAINT fk1m6jvvic23pbncriwaqsotamf FOREIGN KEY (external_advisors_rows_id) REFERENCES startrack.external_advisors_rows(id);


--
-- Name: project_create fk4g4onfptf209so2f47xnhskoq; Type: FK CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create
    ADD CONSTRAINT fk4g4onfptf209so2f47xnhskoq FOREIGN KEY (modify_user) REFERENCES startrack."user"(email);


--
-- Name: project_create_sub_contractors_rows fk4u639bhxf3ay9dwmxbjchg0w; Type: FK CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_sub_contractors_rows
    ADD CONSTRAINT fk4u639bhxf3ay9dwmxbjchg0w FOREIGN KEY (sub_contractors_rows_id) REFERENCES startrack.sub_contractors_rows(id);


--
-- Name: user_roles fk55itppkw3i07do3h7qoclqd4k; Type: FK CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.user_roles
    ADD CONSTRAINT fk55itppkw3i07do3h7qoclqd4k FOREIGN KEY (user_id) REFERENCES startrack."user"(id);


--
-- Name: project_create_output_rows fk5nhgegvqbdiv6nxfrbiv9kfly; Type: FK CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_output_rows
    ADD CONSTRAINT fk5nhgegvqbdiv6nxfrbiv9kfly FOREIGN KEY (project_create_id) REFERENCES startrack.project_create(id);


--
-- Name: project_create_sub_contractors_rows fk95c8s7d2yptpdpn3huu5j04lk; Type: FK CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_sub_contractors_rows
    ADD CONSTRAINT fk95c8s7d2yptpdpn3huu5j04lk FOREIGN KEY (project_create_id) REFERENCES startrack.project_create(id);


--
-- Name: project_create_collaboration_rows fk9t4wphm5qnhwkfmt63i14mjdl; Type: FK CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_collaboration_rows
    ADD CONSTRAINT fk9t4wphm5qnhwkfmt63i14mjdl FOREIGN KEY (collaboration_rows_id) REFERENCES startrack.collaboration_rows(id);


--
-- Name: project_create_group_member_rows fkac0wtc37myxibgmdn4jj4q6lr; Type: FK CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_group_member_rows
    ADD CONSTRAINT fkac0wtc37myxibgmdn4jj4q6lr FOREIGN KEY (project_create_id) REFERENCES startrack.project_create(id);


--
-- Name: project_create_ppi_rows fkb2uvjcb9y3avaouyd2coydmi1; Type: FK CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_ppi_rows
    ADD CONSTRAINT fkb2uvjcb9y3avaouyd2coydmi1 FOREIGN KEY (ppi_rows_id) REFERENCES startrack.ppi_rows(id);


--
-- Name: project_create_funding_rows fke1w959b45yndc0by93tfxe99q; Type: FK CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_funding_rows
    ADD CONSTRAINT fke1w959b45yndc0by93tfxe99q FOREIGN KEY (project_create_id) REFERENCES startrack.project_create(id);


--
-- Name: project_create_group_member_rows fkfk5qt1vixh8ovhhmd42aoip7s; Type: FK CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_group_member_rows
    ADD CONSTRAINT fkfk5qt1vixh8ovhhmd42aoip7s FOREIGN KEY (group_member_rows_id) REFERENCES startrack.group_member_rows(id);


--
-- Name: user_roles fkh8ciramu9cc9q3qcqiv4ue8a6; Type: FK CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.user_roles
    ADD CONSTRAINT fkh8ciramu9cc9q3qcqiv4ue8a6 FOREIGN KEY (role_id) REFERENCES startrack.roles(id);


--
-- Name: project_create_funding_overview_rows fkh9b6bq39olid9l3en0kl7i3v8; Type: FK CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_funding_overview_rows
    ADD CONSTRAINT fkh9b6bq39olid9l3en0kl7i3v8 FOREIGN KEY (funding_overview_rows_id) REFERENCES startrack.funding_overview_rows(id);


--
-- Name: project_create_output_rows fkijpe6ioutdcpee5xqxfadl80g; Type: FK CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_output_rows
    ADD CONSTRAINT fkijpe6ioutdcpee5xqxfadl80g FOREIGN KEY (output_rows_id) REFERENCES startrack.output_rows(id);


--
-- Name: project_create_otr_rows fkixae0wyj78npw823waii34yt8; Type: FK CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_otr_rows
    ADD CONSTRAINT fkixae0wyj78npw823waii34yt8 FOREIGN KEY (otr_rows_id) REFERENCES startrack.otr_rows(id);


--
-- Name: project_create fkk0pcu363i9enx2uvovr6xdgf1; Type: FK CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create
    ADD CONSTRAINT fkk0pcu363i9enx2uvovr6xdgf1 FOREIGN KEY (apply_user) REFERENCES startrack."user"(email);


--
-- Name: project_create_ppi_rows fkpcriuq69freljtbc1gsil4cp; Type: FK CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_ppi_rows
    ADD CONSTRAINT fkpcriuq69freljtbc1gsil4cp FOREIGN KEY (project_create_id) REFERENCES startrack.project_create(id);


--
-- Name: project_create_funding_rows fkpytl33fxx8gbtigy2qtgice1o; Type: FK CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_funding_rows
    ADD CONSTRAINT fkpytl33fxx8gbtigy2qtgice1o FOREIGN KEY (funding_rows_id) REFERENCES startrack.funding_rows(id);


--
-- Name: project_create_funding_overview_rows fkqy5wbwma1ofnkne7amubnv326; Type: FK CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_funding_overview_rows
    ADD CONSTRAINT fkqy5wbwma1ofnkne7amubnv326 FOREIGN KEY (project_create_id) REFERENCES startrack.project_create(id);


--
-- Name: project_create_collaboration_rows fkrrwnj6inafnf7bu4lya0r8hj5; Type: FK CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_collaboration_rows
    ADD CONSTRAINT fkrrwnj6inafnf7bu4lya0r8hj5 FOREIGN KEY (project_create_id) REFERENCES startrack.project_create(id);


--
-- Name: project_create_otr_rows fkt6a2jridvwbc23isqtndirql1; Type: FK CONSTRAINT; Schema: startrack; Owner: -
--

ALTER TABLE ONLY startrack.project_create_otr_rows
    ADD CONSTRAINT fkt6a2jridvwbc23isqtndirql1 FOREIGN KEY (project_create_id) REFERENCES startrack.project_create(id);


--
-- PostgreSQL database dump complete
--
