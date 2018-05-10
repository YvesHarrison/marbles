PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE account(
  sha_value char(255) NOT NULL,
  ac_id char(8) NOT NULL,
  ac_short_name char(16) DEFAULT NULL,
  status char(1) DEFAULT NULL,
  term_date TEXT DEFAULT NULL,
  inception_date TEXT DEFAULT NULL,
  ac_region char(2) DEFAULT NULL,
  ac_sub_region char(2) DEFAULT NULL,
  cod_country_domicile char(2) DEFAULT NULL,
  liq_method char(2) DEFAULT NULL,
  contracting_entity char(4) DEFAULT NULL,
  mgn_entity char(4) DEFAULT NULL,
  ac_legal_name char(150) DEFAULT NULL,
  manager_name char(80) DEFAULT NULL,
  cod_ccy_base char(3) DEFAULT NULL,
  longname char(50) DEFAULT NULL,
  mandate_id char(20) DEFAULT NULL,
  client_id char(10) DEFAULT NULL,
  custodian_name char(60) DEFAULT NULL,
  sub_mandate_id char(20) DEFAULT NULL,
  transfer_agent_name char(30) DEFAULT NULL,
  trust_bank char(15) DEFAULT NULL,
  re_trust_bank char(15) DEFAULT NULL,
  last_updated_by char(8) DEFAULT NULL,
  last_approved_by char(8) DEFAULT NULL,
  last_update_date TEXT DEFAULT NULL,
  flag int NOT NULL DEFAULT 0
);

CREATE TABLE ac_benchmark(
  sha_value char(255) NOT NULL,
  ac_id char(8) NOT NULL,
  benchmark_id char(20) NOT NULL,
  source char(50) DEFAULT NULL,
  name char(50) DEFAULT NULL,
  currency char(3) DEFAULT NULL,
  primary_flag char(1) DEFAULT NULL,
  start_date TEXT DEFAULT NULL,
  end_date TimeStamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  benchmark_reference_id char(20) DEFAULT NULL,
  benchmark_reference_id_source char(50) DEFAULT NULL,
  flag int NOT NULL DEFAULT 0
);

CREATE TABLE ac_trade(
  sha_value char(255) NOT NULL,
  ac_id char(8) NOT NULL,
  lvts char(1) DEFAULT NULL,
  calypso char(1) DEFAULT NULL,
  aladdin varchar(1) DEFAULT NULL,
  trade_start_date TEXT DEFAULT NULL,
  equity char(1) DEFAULT NULL,
  fixed_income char(1) DEFAULT NULL,
  flag int NOT NULL DEFAULT 0
);

CREATE TABLE `benchmarks` (
  sha_value char(255) NOT NULL,
  benchmark_id char(20) NOT NULL,
  id_source char(50) NOT NULL,
  name char(50) DEFAULT NULL,
  currency char(3) DEFAULT NULL,
  benchmark_reference_id char(20) NOT NULL,
  benchmark_reference_id_source char(50) DEFAULT NULL,
  flag int NOT NULL DEFAULT 0
);

COMMIT;
