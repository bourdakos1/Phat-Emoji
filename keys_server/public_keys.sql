DROP DATABASE IF EXISTS public_keys;
CREATE DATABASE public_keys;

\c public_keys;

CREATE TABLE keys (
    ID SERIAL PRIMARY KEY,

    registration_id INTEGER,
    identity_key_pub VARCHAR,

    signed_pre_key_id INTEGER,
    signed_pre_key_pub VARCHAR,
    signed_pre_key_sig VARCHAR,

    pre_key_id INTEGER,
    pre_key_pub VARCHAR
);

INSERT INTO keys (
        ID,
        registration_id,
        identity_key_pub,
        signed_pre_key_id,
        signed_pre_key_pub,
        signed_pre_key_sig,
        pre_key_id,
        pre_key_pub
    )
    VALUES (
        1819543328,
        9,
        'BXTDt0PCjMKaYFN3w5fCv8KAwqJNw4LDncKBdw4swq5TGULDmcKaV8OlN0zDvG4T',
        1,
        'BQnDqgvDm2Nbw65eJMOIJ1QvRF7CrsKPwqXCksK7BCpMfX4ULkHDuRQ0Qg==',
        'dcOhFSjClcOvKyLDiFDCs8KMw6PCv8OeKsOZejXDm1lqwpHCnsK2wpjDrz8+w79ZfcOpWUPCrzTCkMKqUMKjw6Ydw5Yiw4B4w4Z4RVUJMgt2wpDDnynCvn8Uw4nDnsKJ',
        1,
        'BXDDgcK1YTXClXsjw5NBw7/CjcOjKsONw7cdAcKrw4gnSRzDrMOoMHVdUHYafQ=='
    );
