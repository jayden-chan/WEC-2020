--
-- PostgreSQL database dump
--

-- Dumped from database version 12.1
-- Dumped by pg_dump version 12.1

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
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bobby; Type: TABLE; Schema: public; Owner: jayden
--

CREATE TABLE public.bobby (
    date timestamp without time zone,
    type text,
    amount double precision,
    title text,
    accepted boolean
);


ALTER TABLE public.bobby OWNER TO jayden;

--
-- Name: costco; Type: TABLE; Schema: public; Owner: jayden
--

CREATE TABLE public.costco (
    date timestamp without time zone,
    open double precision,
    high double precision,
    low double precision,
    close double precision
);


ALTER TABLE public.costco OWNER TO jayden;

--
-- Name: data; Type: TABLE; Schema: public; Owner: jayden
--

CREATE TABLE public.data (
    username text,
    password text
);


ALTER TABLE public.data OWNER TO jayden;

--
-- Name: investments; Type: TABLE; Schema: public; Owner: jayden
--

CREATE TABLE public.investments (
    date timestamp without time zone,
    type text,
    amount double precision,
    title text,
    accepted boolean
);


ALTER TABLE public.investments OWNER TO jayden;

--
-- Name: karen_check; Type: TABLE; Schema: public; Owner: jayden
--

CREATE TABLE public.karen_check (
    date timestamp without time zone,
    type text,
    amount double precision,
    title text,
    accepted boolean
);


ALTER TABLE public.karen_check OWNER TO jayden;

--
-- Name: karen_sav; Type: TABLE; Schema: public; Owner: jayden
--

CREATE TABLE public.karen_sav (
    date timestamp without time zone,
    type text,
    amount double precision,
    title text,
    accepted boolean
);


ALTER TABLE public.karen_sav OWNER TO jayden;

--
-- Name: loblaws; Type: TABLE; Schema: public; Owner: jayden
--

CREATE TABLE public.loblaws (
    date timestamp without time zone,
    open double precision,
    high double precision,
    low double precision,
    close double precision
);


ALTER TABLE public.loblaws OWNER TO jayden;

--
-- Name: macys; Type: TABLE; Schema: public; Owner: jayden
--

CREATE TABLE public.macys (
    date timestamp without time zone,
    open double precision,
    high double precision,
    low double precision,
    close double precision
);


ALTER TABLE public.macys OWNER TO jayden;

--
-- Name: stocks; Type: TABLE; Schema: public; Owner: jayden
--

CREATE TABLE public.stocks (
    costco integer,
    macys integer,
    loblaws integer,
    tesla integer
);


ALTER TABLE public.stocks OWNER TO jayden;

--
-- Name: tesla; Type: TABLE; Schema: public; Owner: jayden
--

CREATE TABLE public.tesla (
    date timestamp without time zone,
    open double precision,
    high double precision,
    low double precision,
    close double precision
);


ALTER TABLE public.tesla OWNER TO jayden;

--
-- PostgreSQL database dump complete
--

