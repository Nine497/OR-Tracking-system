PGDMP  '    (                |            or_tracking    17.2    17.2 o    z           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            {           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            |           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            }           1262    16984    or_tracking    DATABASE     }   CREATE DATABASE or_tracking WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Thai_Thailand.874';
    DROP DATABASE or_tracking;
                     postgres    false            �            1259    17627    doctors    TABLE     �   CREATE TABLE public.doctors (
    doctors_id integer NOT NULL,
    firstname character varying(255),
    lastname character varying(255),
    specialization character varying(255),
    "isActive" boolean NOT NULL
);
    DROP TABLE public.doctors;
       public         heap r       postgres    false            �            1259    17626    doctors_doctors_id_seq    SEQUENCE     �   CREATE SEQUENCE public.doctors_doctors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.doctors_doctors_id_seq;
       public               postgres    false    226            ~           0    0    doctors_doctors_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.doctors_doctors_id_seq OWNED BY public.doctors.doctors_id;
          public               postgres    false    225            �            1259    17694    link_reviews    TABLE     �   CREATE TABLE public.link_reviews (
    review_id integer NOT NULL,
    surgery_case_links_id integer,
    review_text text NOT NULL,
    rating integer NOT NULL,
    reviewed_at timestamp with time zone NOT NULL
);
     DROP TABLE public.link_reviews;
       public         heap r       postgres    false            �            1259    17693    link_reviews_review_id_seq    SEQUENCE     �   CREATE SEQUENCE public.link_reviews_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE public.link_reviews_review_id_seq;
       public               postgres    false    242                       0    0    link_reviews_review_id_seq    SEQUENCE OWNED BY     Y   ALTER SEQUENCE public.link_reviews_review_id_seq OWNED BY public.link_reviews.review_id;
          public               postgres    false    241            �            1259    17645    operating_room    TABLE       CREATE TABLE public.operating_room (
    operating_room_id integer NOT NULL,
    room_name character varying(255),
    room_type character varying(255),
    location character varying(255),
    created_at timestamp with time zone,
    "New column" boolean NOT NULL
);
 "   DROP TABLE public.operating_room;
       public         heap r       postgres    false            �            1259    17644 $   operating_room_operating_room_id_seq    SEQUENCE     �   CREATE SEQUENCE public.operating_room_operating_room_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ;   DROP SEQUENCE public.operating_room_operating_room_id_seq;
       public               postgres    false    230            �           0    0 $   operating_room_operating_room_id_seq    SEQUENCE OWNED BY     m   ALTER SEQUENCE public.operating_room_operating_room_id_seq OWNED BY public.operating_room.operating_room_id;
          public               postgres    false    229            �            1259    17636    patients    TABLE       CREATE TABLE public.patients (
    patients_id integer NOT NULL,
    "HN_code" integer,
    firstname character varying(255),
    lastname character varying(255),
    "DOB" timestamp with time zone,
    gender character varying(255),
    patient_history character varying(255)
);
    DROP TABLE public.patients;
       public         heap r       postgres    false            �            1259    17635    patients_patients_id_seq    SEQUENCE     �   CREATE SEQUENCE public.patients_patients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.patients_patients_id_seq;
       public               postgres    false    228            �           0    0    patients_patients_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.patients_patients_id_seq OWNED BY public.patients.patients_id;
          public               postgres    false    227            �            1259    17604    permissions    TABLE     �   CREATE TABLE public.permissions (
    permission_id integer NOT NULL,
    permission_name character varying(255),
    permission_des character varying(255)
);
    DROP TABLE public.permissions;
       public         heap r       postgres    false            �            1259    17603    permissions_permission_id_seq    SEQUENCE     �   CREATE SEQUENCE public.permissions_permission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 4   DROP SEQUENCE public.permissions_permission_id_seq;
       public               postgres    false    220            �           0    0    permissions_permission_id_seq    SEQUENCE OWNED BY     _   ALTER SEQUENCE public.permissions_permission_id_seq OWNED BY public.permissions.permission_id;
          public               postgres    false    219            �            1259    17593    staff    TABLE       CREATE TABLE public.staff (
    staff_id integer NOT NULL,
    username character varying(255),
    password character varying(255),
    firstname character varying(255),
    lastname character varying(255),
    created_at timestamp with time zone,
    "isActive" boolean NOT NULL
);
    DROP TABLE public.staff;
       public         heap r       postgres    false            �            1259    17654    staff_permission    TABLE     �   CREATE TABLE public.staff_permission (
    staff_permission_id integer NOT NULL,
    staff_id integer,
    permission_id integer,
    gived_at timestamp with time zone,
    gived_by integer
);
 $   DROP TABLE public.staff_permission;
       public         heap r       postgres    false            �            1259    17653 (   staff_permission_staff_permission_id_seq    SEQUENCE     �   CREATE SEQUENCE public.staff_permission_staff_permission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ?   DROP SEQUENCE public.staff_permission_staff_permission_id_seq;
       public               postgres    false    232            �           0    0 (   staff_permission_staff_permission_id_seq    SEQUENCE OWNED BY     u   ALTER SEQUENCE public.staff_permission_staff_permission_id_seq OWNED BY public.staff_permission.staff_permission_id;
          public               postgres    false    231            �            1259    17592    staff_staff_id_seq    SEQUENCE     �   CREATE SEQUENCE public.staff_staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.staff_staff_id_seq;
       public               postgres    false    218            �           0    0    staff_staff_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.staff_staff_id_seq OWNED BY public.staff.staff_id;
          public               postgres    false    217            �            1259    17620    status    TABLE     g   CREATE TABLE public.status (
    status_id integer NOT NULL,
    status_name character varying(255)
);
    DROP TABLE public.status;
       public         heap r       postgres    false            �            1259    17619    status_status_id_seq    SEQUENCE     �   CREATE SEQUENCE public.status_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.status_status_id_seq;
       public               postgres    false    224            �           0    0    status_status_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.status_status_id_seq OWNED BY public.status.status_id;
          public               postgres    false    223            �            1259    17661    surgery_case    TABLE     r  CREATE TABLE public.surgery_case (
    _id integer NOT NULL,
    patient_id integer,
    doctor_id integer,
    or_room_id integer,
    created_by integer,
    status integer,
    created_at timestamp with time zone,
    surgery_date timestamp with time zone,
    estimate_start_time time without time zone,
    estimate_duration integer,
    surgery_type_id integer
);
     DROP TABLE public.surgery_case;
       public         heap r       postgres    false            �            1259    17660    surgery_case__id_seq    SEQUENCE     �   CREATE SEQUENCE public.surgery_case__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.surgery_case__id_seq;
       public               postgres    false    234            �           0    0    surgery_case__id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.surgery_case__id_seq OWNED BY public.surgery_case._id;
          public               postgres    false    233            �            1259    17684    surgery_case_links    TABLE     d  CREATE TABLE public.surgery_case_links (
    surgery_case_links_id integer NOT NULL,
    surgery_case_id integer,
    jwt_token text,
    expiration_time time without time zone,
    created_by integer,
    created_at timestamp with time zone,
    "loggedInCount" integer,
    last_accessed timestamp with time zone,
    "isActive" boolean DEFAULT false
);
 &   DROP TABLE public.surgery_case_links;
       public         heap r       postgres    false            �            1259    17683 ,   surgery_case_links_surgery_case_links_id_seq    SEQUENCE     �   CREATE SEQUENCE public.surgery_case_links_surgery_case_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 C   DROP SEQUENCE public.surgery_case_links_surgery_case_links_id_seq;
       public               postgres    false    240            �           0    0 ,   surgery_case_links_surgery_case_links_id_seq    SEQUENCE OWNED BY     }   ALTER SEQUENCE public.surgery_case_links_surgery_case_links_id_seq OWNED BY public.surgery_case_links.surgery_case_links_id;
          public               postgres    false    239            �            1259    17668    surgery_case_status_history    TABLE     �   CREATE TABLE public.surgery_case_status_history (
    surgery_case_status_history_id integer NOT NULL,
    surgery_case_id integer,
    status_id integer,
    updated_at timestamp with time zone,
    updated_by integer
);
 /   DROP TABLE public.surgery_case_status_history;
       public         heap r       postgres    false            �            1259    17667 >   surgery_case_status_history_surgery_case_status_history_id_seq    SEQUENCE     �   CREATE SEQUENCE public.surgery_case_status_history_surgery_case_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 U   DROP SEQUENCE public.surgery_case_status_history_surgery_case_status_history_id_seq;
       public               postgres    false    236            �           0    0 >   surgery_case_status_history_surgery_case_status_history_id_seq    SEQUENCE OWNED BY     �   ALTER SEQUENCE public.surgery_case_status_history_surgery_case_status_history_id_seq OWNED BY public.surgery_case_status_history.surgery_case_status_history_id;
          public               postgres    false    235            �            1259    17613    surgery_type    TABLE     y   CREATE TABLE public.surgery_type (
    surgery_type_id integer NOT NULL,
    surgery_type_name character varying(255)
);
     DROP TABLE public.surgery_type;
       public         heap r       postgres    false            �            1259    17612     surgery_type_surgery_type_id_seq    SEQUENCE     �   CREATE SEQUENCE public.surgery_type_surgery_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 7   DROP SEQUENCE public.surgery_type_surgery_type_id_seq;
       public               postgres    false    222            �           0    0     surgery_type_surgery_type_id_seq    SEQUENCE OWNED BY     e   ALTER SEQUENCE public.surgery_type_surgery_type_id_seq OWNED BY public.surgery_type.surgery_type_id;
          public               postgres    false    221            �            1259    17675    translations    TABLE     �   CREATE TABLE public.translations (
    translations_id integer NOT NULL,
    ref_id integer NOT NULL,
    language_code character varying(10),
    translated_text text,
    section character varying(255) NOT NULL
);
     DROP TABLE public.translations;
       public         heap r       postgres    false            �            1259    17674     translations_translations_id_seq    SEQUENCE     �   CREATE SEQUENCE public.translations_translations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 7   DROP SEQUENCE public.translations_translations_id_seq;
       public               postgres    false    238            �           0    0     translations_translations_id_seq    SEQUENCE OWNED BY     e   ALTER SEQUENCE public.translations_translations_id_seq OWNED BY public.translations.translations_id;
          public               postgres    false    237            �           2604    17630    doctors doctors_id    DEFAULT     x   ALTER TABLE ONLY public.doctors ALTER COLUMN doctors_id SET DEFAULT nextval('public.doctors_doctors_id_seq'::regclass);
 A   ALTER TABLE public.doctors ALTER COLUMN doctors_id DROP DEFAULT;
       public               postgres    false    225    226    226            �           2604    17697    link_reviews review_id    DEFAULT     �   ALTER TABLE ONLY public.link_reviews ALTER COLUMN review_id SET DEFAULT nextval('public.link_reviews_review_id_seq'::regclass);
 E   ALTER TABLE public.link_reviews ALTER COLUMN review_id DROP DEFAULT;
       public               postgres    false    242    241    242            �           2604    17648     operating_room operating_room_id    DEFAULT     �   ALTER TABLE ONLY public.operating_room ALTER COLUMN operating_room_id SET DEFAULT nextval('public.operating_room_operating_room_id_seq'::regclass);
 O   ALTER TABLE public.operating_room ALTER COLUMN operating_room_id DROP DEFAULT;
       public               postgres    false    229    230    230            �           2604    17639    patients patients_id    DEFAULT     |   ALTER TABLE ONLY public.patients ALTER COLUMN patients_id SET DEFAULT nextval('public.patients_patients_id_seq'::regclass);
 C   ALTER TABLE public.patients ALTER COLUMN patients_id DROP DEFAULT;
       public               postgres    false    228    227    228            �           2604    17596    staff staff_id    DEFAULT     p   ALTER TABLE ONLY public.staff ALTER COLUMN staff_id SET DEFAULT nextval('public.staff_staff_id_seq'::regclass);
 =   ALTER TABLE public.staff ALTER COLUMN staff_id DROP DEFAULT;
       public               postgres    false    218    217    218            �           2604    17657 $   staff_permission staff_permission_id    DEFAULT     �   ALTER TABLE ONLY public.staff_permission ALTER COLUMN staff_permission_id SET DEFAULT nextval('public.staff_permission_staff_permission_id_seq'::regclass);
 S   ALTER TABLE public.staff_permission ALTER COLUMN staff_permission_id DROP DEFAULT;
       public               postgres    false    231    232    232            �           2604    17623    status status_id    DEFAULT     t   ALTER TABLE ONLY public.status ALTER COLUMN status_id SET DEFAULT nextval('public.status_status_id_seq'::regclass);
 ?   ALTER TABLE public.status ALTER COLUMN status_id DROP DEFAULT;
       public               postgres    false    224    223    224            �           2604    17664    surgery_case _id    DEFAULT     t   ALTER TABLE ONLY public.surgery_case ALTER COLUMN _id SET DEFAULT nextval('public.surgery_case__id_seq'::regclass);
 ?   ALTER TABLE public.surgery_case ALTER COLUMN _id DROP DEFAULT;
       public               postgres    false    233    234    234            �           2604    17687 (   surgery_case_links surgery_case_links_id    DEFAULT     �   ALTER TABLE ONLY public.surgery_case_links ALTER COLUMN surgery_case_links_id SET DEFAULT nextval('public.surgery_case_links_surgery_case_links_id_seq'::regclass);
 W   ALTER TABLE public.surgery_case_links ALTER COLUMN surgery_case_links_id DROP DEFAULT;
       public               postgres    false    240    239    240            �           2604    17671 :   surgery_case_status_history surgery_case_status_history_id    DEFAULT     �   ALTER TABLE ONLY public.surgery_case_status_history ALTER COLUMN surgery_case_status_history_id SET DEFAULT nextval('public.surgery_case_status_history_surgery_case_status_history_id_seq'::regclass);
 i   ALTER TABLE public.surgery_case_status_history ALTER COLUMN surgery_case_status_history_id DROP DEFAULT;
       public               postgres    false    235    236    236            �           2604    17616    surgery_type surgery_type_id    DEFAULT     �   ALTER TABLE ONLY public.surgery_type ALTER COLUMN surgery_type_id SET DEFAULT nextval('public.surgery_type_surgery_type_id_seq'::regclass);
 K   ALTER TABLE public.surgery_type ALTER COLUMN surgery_type_id DROP DEFAULT;
       public               postgres    false    222    221    222            �           2604    17678    translations translations_id    DEFAULT     �   ALTER TABLE ONLY public.translations ALTER COLUMN translations_id SET DEFAULT nextval('public.translations_translations_id_seq'::regclass);
 K   ALTER TABLE public.translations ALTER COLUMN translations_id DROP DEFAULT;
       public               postgres    false    237    238    238            g          0    17627    doctors 
   TABLE DATA           ^   COPY public.doctors (doctors_id, firstname, lastname, specialization, "isActive") FROM stdin;
    public               postgres    false    226   ��       w          0    17694    link_reviews 
   TABLE DATA           j   COPY public.link_reviews (review_id, surgery_case_links_id, review_text, rating, reviewed_at) FROM stdin;
    public               postgres    false    242   ��       k          0    17645    operating_room 
   TABLE DATA           u   COPY public.operating_room (operating_room_id, room_name, room_type, location, created_at, "New column") FROM stdin;
    public               postgres    false    230   ϖ       i          0    17636    patients 
   TABLE DATA           o   COPY public.patients (patients_id, "HN_code", firstname, lastname, "DOB", gender, patient_history) FROM stdin;
    public               postgres    false    228   �       a          0    17604    permissions 
   TABLE DATA           U   COPY public.permissions (permission_id, permission_name, permission_des) FROM stdin;
    public               postgres    false    220   	�       _          0    17593    staff 
   TABLE DATA           j   COPY public.staff (staff_id, username, password, firstname, lastname, created_at, "isActive") FROM stdin;
    public               postgres    false    218   w�       m          0    17654    staff_permission 
   TABLE DATA           l   COPY public.staff_permission (staff_permission_id, staff_id, permission_id, gived_at, gived_by) FROM stdin;
    public               postgres    false    232   K�       e          0    17620    status 
   TABLE DATA           8   COPY public.status (status_id, status_name) FROM stdin;
    public               postgres    false    224   ��       o          0    17661    surgery_case 
   TABLE DATA           �   COPY public.surgery_case (_id, patient_id, doctor_id, or_room_id, created_by, status, created_at, surgery_date, estimate_start_time, estimate_duration, surgery_type_id) FROM stdin;
    public               postgres    false    234   ��       u          0    17684    surgery_case_links 
   TABLE DATA           �   COPY public.surgery_case_links (surgery_case_links_id, surgery_case_id, jwt_token, expiration_time, created_by, created_at, "loggedInCount", last_accessed, "isActive") FROM stdin;
    public               postgres    false    240   ڙ       q          0    17668    surgery_case_status_history 
   TABLE DATA           �   COPY public.surgery_case_status_history (surgery_case_status_history_id, surgery_case_id, status_id, updated_at, updated_by) FROM stdin;
    public               postgres    false    236   ��       c          0    17613    surgery_type 
   TABLE DATA           J   COPY public.surgery_type (surgery_type_id, surgery_type_name) FROM stdin;
    public               postgres    false    222   �       s          0    17675    translations 
   TABLE DATA           h   COPY public.translations (translations_id, ref_id, language_code, translated_text, section) FROM stdin;
    public               postgres    false    238   1�       �           0    0    doctors_doctors_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.doctors_doctors_id_seq', 1, false);
          public               postgres    false    225            �           0    0    link_reviews_review_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.link_reviews_review_id_seq', 1, false);
          public               postgres    false    241            �           0    0 $   operating_room_operating_room_id_seq    SEQUENCE SET     S   SELECT pg_catalog.setval('public.operating_room_operating_room_id_seq', 1, false);
          public               postgres    false    229            �           0    0    patients_patients_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.patients_patients_id_seq', 1, false);
          public               postgres    false    227            �           0    0    permissions_permission_id_seq    SEQUENCE SET     L   SELECT pg_catalog.setval('public.permissions_permission_id_seq', 1, false);
          public               postgres    false    219            �           0    0 (   staff_permission_staff_permission_id_seq    SEQUENCE SET     V   SELECT pg_catalog.setval('public.staff_permission_staff_permission_id_seq', 8, true);
          public               postgres    false    231            �           0    0    staff_staff_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.staff_staff_id_seq', 4, true);
          public               postgres    false    217            �           0    0    status_status_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.status_status_id_seq', 1, false);
          public               postgres    false    223            �           0    0    surgery_case__id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.surgery_case__id_seq', 1, false);
          public               postgres    false    233            �           0    0 ,   surgery_case_links_surgery_case_links_id_seq    SEQUENCE SET     [   SELECT pg_catalog.setval('public.surgery_case_links_surgery_case_links_id_seq', 1, false);
          public               postgres    false    239            �           0    0 >   surgery_case_status_history_surgery_case_status_history_id_seq    SEQUENCE SET     m   SELECT pg_catalog.setval('public.surgery_case_status_history_surgery_case_status_history_id_seq', 1, false);
          public               postgres    false    235            �           0    0     surgery_type_surgery_type_id_seq    SEQUENCE SET     O   SELECT pg_catalog.setval('public.surgery_type_surgery_type_id_seq', 1, false);
          public               postgres    false    221            �           0    0     translations_translations_id_seq    SEQUENCE SET     O   SELECT pg_catalog.setval('public.translations_translations_id_seq', 1, false);
          public               postgres    false    237            �           2606    17634    doctors doctors_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (doctors_id);
 >   ALTER TABLE ONLY public.doctors DROP CONSTRAINT doctors_pkey;
       public                 postgres    false    226            �           2606    17701    link_reviews link_reviews_pkey 
   CONSTRAINT     c   ALTER TABLE ONLY public.link_reviews
    ADD CONSTRAINT link_reviews_pkey PRIMARY KEY (review_id);
 H   ALTER TABLE ONLY public.link_reviews DROP CONSTRAINT link_reviews_pkey;
       public                 postgres    false    242            �           2606    17652 "   operating_room operating_room_pkey 
   CONSTRAINT     o   ALTER TABLE ONLY public.operating_room
    ADD CONSTRAINT operating_room_pkey PRIMARY KEY (operating_room_id);
 L   ALTER TABLE ONLY public.operating_room DROP CONSTRAINT operating_room_pkey;
       public                 postgres    false    230            �           2606    17643    patients patients_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (patients_id);
 @   ALTER TABLE ONLY public.patients DROP CONSTRAINT patients_pkey;
       public                 postgres    false    228            �           2606    17611    permissions permissions_pkey 
   CONSTRAINT     e   ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (permission_id);
 F   ALTER TABLE ONLY public.permissions DROP CONSTRAINT permissions_pkey;
       public                 postgres    false    220            �           2606    17659 &   staff_permission staff_permission_pkey 
   CONSTRAINT     u   ALTER TABLE ONLY public.staff_permission
    ADD CONSTRAINT staff_permission_pkey PRIMARY KEY (staff_permission_id);
 P   ALTER TABLE ONLY public.staff_permission DROP CONSTRAINT staff_permission_pkey;
       public                 postgres    false    232            �           2606    17600    staff staff_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (staff_id);
 :   ALTER TABLE ONLY public.staff DROP CONSTRAINT staff_pkey;
       public                 postgres    false    218            �           2606    17780    staff staff_username_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_username_key UNIQUE (username);
 B   ALTER TABLE ONLY public.staff DROP CONSTRAINT staff_username_key;
       public                 postgres    false    218            �           2606    17782    staff staff_username_unique 
   CONSTRAINT     Z   ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_username_unique UNIQUE (username);
 E   ALTER TABLE ONLY public.staff DROP CONSTRAINT staff_username_unique;
       public                 postgres    false    218            �           2606    17625    status status_pkey 
   CONSTRAINT     W   ALTER TABLE ONLY public.status
    ADD CONSTRAINT status_pkey PRIMARY KEY (status_id);
 <   ALTER TABLE ONLY public.status DROP CONSTRAINT status_pkey;
       public                 postgres    false    224            �           2606    17692 *   surgery_case_links surgery_case_links_pkey 
   CONSTRAINT     {   ALTER TABLE ONLY public.surgery_case_links
    ADD CONSTRAINT surgery_case_links_pkey PRIMARY KEY (surgery_case_links_id);
 T   ALTER TABLE ONLY public.surgery_case_links DROP CONSTRAINT surgery_case_links_pkey;
       public                 postgres    false    240            �           2606    17666    surgery_case surgery_case_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY public.surgery_case
    ADD CONSTRAINT surgery_case_pkey PRIMARY KEY (_id);
 H   ALTER TABLE ONLY public.surgery_case DROP CONSTRAINT surgery_case_pkey;
       public                 postgres    false    234            �           2606    17673 <   surgery_case_status_history surgery_case_status_history_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.surgery_case_status_history
    ADD CONSTRAINT surgery_case_status_history_pkey PRIMARY KEY (surgery_case_status_history_id);
 f   ALTER TABLE ONLY public.surgery_case_status_history DROP CONSTRAINT surgery_case_status_history_pkey;
       public                 postgres    false    236            �           2606    17618    surgery_type surgery_type_pkey 
   CONSTRAINT     i   ALTER TABLE ONLY public.surgery_type
    ADD CONSTRAINT surgery_type_pkey PRIMARY KEY (surgery_type_id);
 H   ALTER TABLE ONLY public.surgery_type DROP CONSTRAINT surgery_type_pkey;
       public                 postgres    false    222            �           2606    17682    translations translations_pkey 
   CONSTRAINT     i   ALTER TABLE ONLY public.translations
    ADD CONSTRAINT translations_pkey PRIMARY KEY (translations_id);
 H   ALTER TABLE ONLY public.translations DROP CONSTRAINT translations_pkey;
       public                 postgres    false    238            �           2606    17865 4   link_reviews link_reviews_surgery_case_links_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.link_reviews
    ADD CONSTRAINT link_reviews_surgery_case_links_id_fkey FOREIGN KEY (surgery_case_links_id) REFERENCES public.surgery_case_links(surgery_case_links_id) ON UPDATE CASCADE ON DELETE SET NULL;
 ^   ALTER TABLE ONLY public.link_reviews DROP CONSTRAINT link_reviews_surgery_case_links_id_fkey;
       public               postgres    false    240    242    4795            �           2606    17799 /   staff_permission staff_permission_gived_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.staff_permission
    ADD CONSTRAINT staff_permission_gived_by_fkey FOREIGN KEY (gived_by) REFERENCES public.staff(staff_id) ON UPDATE CASCADE ON DELETE SET NULL;
 Y   ALTER TABLE ONLY public.staff_permission DROP CONSTRAINT staff_permission_gived_by_fkey;
       public               postgres    false    4769    232    218            �           2606    17794 4   staff_permission staff_permission_permission_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.staff_permission
    ADD CONSTRAINT staff_permission_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(permission_id) ON UPDATE CASCADE ON DELETE SET NULL;
 ^   ALTER TABLE ONLY public.staff_permission DROP CONSTRAINT staff_permission_permission_id_fkey;
       public               postgres    false    4775    220    232            �           2606    17789 .   staff_permission staff_permission_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.staff_permission
    ADD CONSTRAINT staff_permission_user_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(staff_id) ON UPDATE CASCADE ON DELETE SET NULL;
 X   ALTER TABLE ONLY public.staff_permission DROP CONSTRAINT staff_permission_user_id_fkey;
       public               postgres    false    232    4769    218            �           2606    17819 )   surgery_case surgery_case_created_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.surgery_case
    ADD CONSTRAINT surgery_case_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.staff(staff_id) ON UPDATE CASCADE ON DELETE SET NULL;
 S   ALTER TABLE ONLY public.surgery_case DROP CONSTRAINT surgery_case_created_by_fkey;
       public               postgres    false    234    4769    218            �           2606    17809 (   surgery_case surgery_case_doctor_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.surgery_case
    ADD CONSTRAINT surgery_case_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(doctors_id) ON UPDATE CASCADE ON DELETE SET NULL;
 R   ALTER TABLE ONLY public.surgery_case DROP CONSTRAINT surgery_case_doctor_id_fkey;
       public               postgres    false    234    4781    226            �           2606    17858 5   surgery_case_links surgery_case_links_created_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.surgery_case_links
    ADD CONSTRAINT surgery_case_links_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.staff(staff_id) ON UPDATE CASCADE ON DELETE SET NULL;
 _   ALTER TABLE ONLY public.surgery_case_links DROP CONSTRAINT surgery_case_links_created_by_fkey;
       public               postgres    false    240    4769    218            �           2606    17853 :   surgery_case_links surgery_case_links_surgery_case_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.surgery_case_links
    ADD CONSTRAINT surgery_case_links_surgery_case_id_fkey FOREIGN KEY (surgery_case_id) REFERENCES public.surgery_case(_id) ON UPDATE CASCADE ON DELETE SET NULL;
 d   ALTER TABLE ONLY public.surgery_case_links DROP CONSTRAINT surgery_case_links_surgery_case_id_fkey;
       public               postgres    false    240    4789    234            �           2606    17814 )   surgery_case surgery_case_or_room_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.surgery_case
    ADD CONSTRAINT surgery_case_or_room_id_fkey FOREIGN KEY (or_room_id) REFERENCES public.operating_room(operating_room_id) ON UPDATE CASCADE ON DELETE SET NULL;
 S   ALTER TABLE ONLY public.surgery_case DROP CONSTRAINT surgery_case_or_room_id_fkey;
       public               postgres    false    234    4785    230            �           2606    17804 )   surgery_case surgery_case_patient_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.surgery_case
    ADD CONSTRAINT surgery_case_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patients_id) ON UPDATE CASCADE ON DELETE SET NULL;
 S   ALTER TABLE ONLY public.surgery_case DROP CONSTRAINT surgery_case_patient_id_fkey;
       public               postgres    false    4783    228    234            �           2606    17824 %   surgery_case surgery_case_status_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.surgery_case
    ADD CONSTRAINT surgery_case_status_fkey FOREIGN KEY (status) REFERENCES public.status(status_id) ON UPDATE CASCADE ON DELETE SET NULL;
 O   ALTER TABLE ONLY public.surgery_case DROP CONSTRAINT surgery_case_status_fkey;
       public               postgres    false    234    4779    224            �           2606    17843 F   surgery_case_status_history surgery_case_status_history_status_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.surgery_case_status_history
    ADD CONSTRAINT surgery_case_status_history_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.status(status_id) ON UPDATE CASCADE ON DELETE SET NULL;
 p   ALTER TABLE ONLY public.surgery_case_status_history DROP CONSTRAINT surgery_case_status_history_status_id_fkey;
       public               postgres    false    236    4779    224            �           2606    17838 L   surgery_case_status_history surgery_case_status_history_surgery_case_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.surgery_case_status_history
    ADD CONSTRAINT surgery_case_status_history_surgery_case_id_fkey FOREIGN KEY (surgery_case_id) REFERENCES public.surgery_case(_id) ON UPDATE CASCADE ON DELETE SET NULL;
 v   ALTER TABLE ONLY public.surgery_case_status_history DROP CONSTRAINT surgery_case_status_history_surgery_case_id_fkey;
       public               postgres    false    236    4789    234            �           2606    17848 G   surgery_case_status_history surgery_case_status_history_updated_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.surgery_case_status_history
    ADD CONSTRAINT surgery_case_status_history_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.staff(staff_id) ON UPDATE CASCADE ON DELETE SET NULL;
 q   ALTER TABLE ONLY public.surgery_case_status_history DROP CONSTRAINT surgery_case_status_history_updated_by_fkey;
       public               postgres    false    236    4769    218            �           2606    17833 .   surgery_case surgery_case_surgery_type_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.surgery_case
    ADD CONSTRAINT surgery_case_surgery_type_id_fkey FOREIGN KEY (surgery_type_id) REFERENCES public.surgery_type(surgery_type_id) ON UPDATE CASCADE ON DELETE SET NULL;
 X   ALTER TABLE ONLY public.surgery_case DROP CONSTRAINT surgery_case_surgery_type_id_fkey;
       public               postgres    false    234    4777    222            g      x������ � �      w      x������ � �      k      x������ � �      i      x������ � �      a   ^  x�mRKO�0>���?���c�'\@���x[DS�lڿ�i*V�&���?{=�7݆��#�SN�)r��>�A�)�$�V�G2n����9im���N.Nh��P `Ľ����e@c�<���_��m�Q��j�ҵ#`�P�e�bI�y�E㋭�&�Q�d���V��<��]ët*Q��]��LKէ�[O�:?9:M���K#͢Q��^X�2-�*�������w�.~-��D�3�{����8���Чe�L�J�ȗ�ж��d
�4O'���q���=l�9u/���C�J(ٙ*5��n�Z�Ӭ����R����y'�E;��-�a�]-j&kJ������_      _   �   x�Mͻ�0@�<����K�lF�F��りP�(%ħw0Q�3��!�t�l8ٔ؏n��:f�êu��I�.�`E�'��5�T$��E撐!��4bfPdʬAqQ�<U>�0��Gin�8��5G�нq�5��l����;%޶6��(_^���0� �yg��
K�U����J�|�uCNB�� ć=b˲��A�      m   E   x��ʹ�0��p���$�Z�(��7�( !��b�ĕ���$��&�UQ۸+Z���������      e      x������ � �      o      x������ � �      u      x������ � �      q      x������ � �      c      x������ � �      s      x������ � �     