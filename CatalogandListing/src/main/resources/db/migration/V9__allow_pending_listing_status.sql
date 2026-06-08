ALTER TABLE public.listings
    DROP CONSTRAINT IF EXISTS listings_status_check;

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_status_check
    CHECK (
        (status)::text = ANY (
            ARRAY[
                'PENDING'::character varying,
                'ACTIVE'::character varying,
                'HIDDEN'::character varying,
                'DELETED'::character varying
            ]::text[]
        )
    );
