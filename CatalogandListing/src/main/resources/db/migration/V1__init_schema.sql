--
-- PostgreSQL database dump
--

\restrict UHSiSbblyfDXihRb9yHLQkKWg3jJFN5nZIhYl8S0KfvKuhflxLopspJzW2aEfhi

-- Dumped from database version 17.9 (Homebrew)
-- Dumped by pg_dump version 17.9 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: complexes; Type: TABLE; Schema: public; Owner: gotravel_db
--

CREATE TABLE public.complexes (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone,
    description text,
    gallery_urls jsonb,
    host_id uuid,
    latitude double precision,
    location public.geometry(Point,4326),
    longitude double precision,
    name character varying(150),
    province character varying(100),
    status character varying(20),
    thumbnail_url character varying(255),
    updated_at timestamp(6) without time zone,
    CONSTRAINT complexes_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'HIDDEN'::character varying])::text[])))
);


ALTER TABLE public.complexes OWNER TO gotravel_db;

--
-- Name: landmark_suggestions; Type: TABLE; Schema: public; Owner: gotravel_db
--

CREATE TABLE public.landmark_suggestions (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone,
    description text,
    host_id uuid,
    name character varying(150),
    reference_image_url character varying(255),
    reject_reason text,
    status character varying(20),
    suggested_latitude double precision,
    suggested_longitude double precision,
    suggested_province character varying(100),
    gallery_urls jsonb,
    thumbnail_url character varying(255),
    CONSTRAINT landmark_suggestions_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'RESOLVED'::character varying, 'REJECTED'::character varying])::text[])))
);


ALTER TABLE public.landmark_suggestions OWNER TO gotravel_db;

--
-- Name: landmarks; Type: TABLE; Schema: public; Owner: gotravel_db
--

CREATE TABLE public.landmarks (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone,
    description text,
    gallery_urls jsonb,
    is_featured boolean,
    latitude double precision,
    location public.geometry(Point,4326),
    longitude double precision,
    name character varying(150),
    province character varying(100),
    radius_meters integer,
    status character varying(20),
    thumbnail_url character varying(255),
    updated_at timestamp(6) without time zone,
    CONSTRAINT landmarks_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'MAINTENANCE'::character varying, 'HIDDEN'::character varying])::text[])))
);


ALTER TABLE public.landmarks OWNER TO gotravel_db;

--
-- Name: listings; Type: TABLE; Schema: public; Owner: gotravel_db
--

CREATE TABLE public.listings (
    id uuid NOT NULL,
    attributes jsonb,
    average_rating numeric(2,1) DEFAULT 0.0,
    base_price numeric(18,2),
    category character varying(20),
    created_at timestamp(6) without time zone,
    description text,
    host_id uuid,
    latitude double precision,
    location public.geometry(Point,4326),
    longitude double precision,
    price_unit character varying(20),
    province character varying(100),
    status character varying(20),
    sub_category character varying(50),
    thumbnail_url character varying(255),
    title character varying(255),
    total_reviews integer DEFAULT 0,
    updated_at timestamp(6) without time zone,
    complex_id uuid,
    CONSTRAINT listings_category_check CHECK (((category)::text = ANY ((ARRAY['STAY'::character varying, 'EXP'::character varying, 'SVC'::character varying])::text[]))),
    CONSTRAINT listings_price_unit_check CHECK (((price_unit)::text = ANY ((ARRAY['PER_NIGHT'::character varying, 'PER_PAX'::character varying, 'PER_HOUR'::character varying])::text[]))),
    CONSTRAINT listings_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'HIDDEN'::character varying, 'DELETED'::character varying])::text[]))),
    CONSTRAINT listings_sub_category_check CHECK (((sub_category)::text = ANY ((ARRAY['PHOTOGRAPHY'::character varying, 'CHEF'::character varying, 'MASSAGE'::character varying, 'PREPARED_MEALS'::character varying, 'TRAINING'::character varying, 'MAKEUP'::character varying, 'HAIR_STYLING'::character varying, 'SPA'::character varying, 'CATERING'::character varying, 'NONE'::character varying])::text[])))
);


ALTER TABLE public.listings OWNER TO gotravel_db;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: gotravel_db
--

CREATE TABLE public.reviews (
    id uuid NOT NULL,
    comment text,
    created_at timestamp(6) without time zone,
    images jsonb,
    rating integer,
    user_id uuid,
    listing_id uuid
);


ALTER TABLE public.reviews OWNER TO gotravel_db;

--
-- Name: complexes complexes_pkey; Type: CONSTRAINT; Schema: public; Owner: gotravel_db
--

ALTER TABLE ONLY public.complexes
    ADD CONSTRAINT complexes_pkey PRIMARY KEY (id);


--
-- Name: landmark_suggestions landmark_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: gotravel_db
--

ALTER TABLE ONLY public.landmark_suggestions
    ADD CONSTRAINT landmark_suggestions_pkey PRIMARY KEY (id);


--
-- Name: landmarks landmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: gotravel_db
--

ALTER TABLE ONLY public.landmarks
    ADD CONSTRAINT landmarks_pkey PRIMARY KEY (id);


--
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: gotravel_db
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: gotravel_db
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: idx_landmark_is_featured; Type: INDEX; Schema: public; Owner: gotravel_db
--

CREATE INDEX idx_landmark_is_featured ON public.landmarks USING btree (is_featured);


--
-- Name: idx_landmark_province; Type: INDEX; Schema: public; Owner: gotravel_db
--

CREATE INDEX idx_landmark_province ON public.landmarks USING btree (province);


--
-- Name: idx_listing_category; Type: INDEX; Schema: public; Owner: gotravel_db
--

CREATE INDEX idx_listing_category ON public.listings USING btree (category);


--
-- Name: idx_listing_complex_id; Type: INDEX; Schema: public; Owner: gotravel_db
--

CREATE INDEX idx_listing_complex_id ON public.listings USING btree (complex_id);


--
-- Name: idx_listing_host_id; Type: INDEX; Schema: public; Owner: gotravel_db
--

CREATE INDEX idx_listing_host_id ON public.listings USING btree (host_id);


--
-- Name: idx_listing_province; Type: INDEX; Schema: public; Owner: gotravel_db
--

CREATE INDEX idx_listing_province ON public.listings USING btree (province);


--
-- Name: idx_listing_sub_category; Type: INDEX; Schema: public; Owner: gotravel_db
--

CREATE INDEX idx_listing_sub_category ON public.listings USING btree (sub_category);


--
-- Name: idx_review_listing_id; Type: INDEX; Schema: public; Owner: gotravel_db
--

CREATE INDEX idx_review_listing_id ON public.reviews USING btree (listing_id);


--
-- Name: reviews fkef8fmvjeprcadspus2mmbo1aa; Type: FK CONSTRAINT; Schema: public; Owner: gotravel_db
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fkef8fmvjeprcadspus2mmbo1aa FOREIGN KEY (listing_id) REFERENCES public.listings(id);


--
-- Name: listings fkio44doe9i7sl81utls1n2pvln; Type: FK CONSTRAINT; Schema: public; Owner: gotravel_db
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT fkio44doe9i7sl81utls1n2pvln FOREIGN KEY (complex_id) REFERENCES public.complexes(id);


--
-- PostgreSQL database dump complete
--

\unrestrict UHSiSbblyfDXihRb9yHLQkKWg3jJFN5nZIhYl8S0KfvKuhflxLopspJzW2aEfhi

