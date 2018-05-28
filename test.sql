PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE account(
  sha_value varchar(256) NOT NULL,
  ac_id varchar(8) NOT NULL,
  ac_short_name varchar(16) DEFAULT NULL,
  status varchar(1) DEFAULT NULL,
  term_date TEXT DEFAULT NULL,
  inception_date TEXT DEFAULT NULL,
  ac_region varchar(2) DEFAULT NULL,
  ac_sub_region varchar(2) DEFAULT NULL,
  cod_country_domicile varchar(2) DEFAULT NULL,
  liq_method varchar(2) DEFAULT NULL,
  contracting_entity varchar(4) DEFAULT NULL,
  mgn_entity varchar(4) DEFAULT NULL,
  ac_legal_name varchar(150) DEFAULT NULL,
  manager_name varchar(80) DEFAULT NULL,
  cod_ccy_base varchar(3) DEFAULT NULL,
  longname varchar(50) DEFAULT NULL,
  mandate_id varchar(20) DEFAULT NULL,
  client_id varchar(10) DEFAULT NULL,
  custodian_name varchar(60) DEFAULT NULL,
  sub_mandate_id varchar(20) DEFAULT NULL,
  transfer_agent_name varchar(30) DEFAULT NULL,
  trust_bank varchar(15) DEFAULT NULL,
  re_trust_bank varchar(15) DEFAULT NULL,
  last_updated_by varchar(8) DEFAULT NULL,
  last_approved_by varchar(8) DEFAULT NULL,
  last_update_date TimeStamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  flag int NOT NULL DEFAULT 0
);

CREATE TABLE ac_benchmark(
  sha_value varchar(256) NOT NULL,
  ac_id varchar(8) NOT NULL,
  benchmark_id varchar(20) NOT NULL,
  source varchar(50) DEFAULT NULL,
  name varchar(50) DEFAULT NULL,
  currency varchar(3) DEFAULT NULL,
  primary_flag varchar(1) DEFAULT NULL,
  start_date TEXT DEFAULT NULL,
  end_date TimeStamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  benchmark_reference_id char(20) DEFAULT NULL,
  benchmark_reference_id_source char(50) DEFAULT NULL,
  flag int NOT NULL DEFAULT 0
);

CREATE TABLE ac_trade(
  sha_value varchar(256) NOT NULL,
  ac_id varchar(8) NOT NULL,
  lvts varchar(1) DEFAULT NULL,
  calypso varchar(1) DEFAULT NULL,
  aladdin varchar(1) DEFAULT NULL,
  trade_start_date TEXT DEFAULT NULL,
  equity varchar(1) DEFAULT NULL,
  fixed_income varchar(1) DEFAULT NULL,
  flag int NOT NULL DEFAULT 0
);

CREATE TABLE `benchmarks` (
  sha_value varchar(256) NOT NULL,
  benchmark_id varchar(20) NOT NULL,
  id_source varchar(50) NOT NULL,
  name varchar(50) DEFAULT NULL,
  currency varchar(3) DEFAULT NULL,
  benchmark_reference_id varchar(20) NOT NULL,
  benchmark_reference_id_source varchar(50) DEFAULT NULL,
  flag int NOT NULL DEFAULT 0
);

COMMIT;
