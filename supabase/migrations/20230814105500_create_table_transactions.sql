create table "public"."transactions" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone default now(),
    "user_id" uuid not null,
    "timestamp" timestamp with time zone default now(),
    "comment" text
);


CREATE UNIQUE INDEX transactions_pkey ON public.transactions USING btree (id);

alter table "public"."transactions" add constraint "transactions_pkey" PRIMARY KEY using index "transactions_pkey";


