create table files (
  `id` serial primary key,
  `path` text not null,
  `name` text not null,
  `modified_at` timestamp not null,
  unique key `full_path` (`path`(1024), `name`(255))
) Engine=innodb default charset utf8 collate utf8_unicode_ci;

create table file_flags (
  `file` bigint unsigned not null,
  `request_identify` boolean not null default false,
  `request_metadata` boolean not null default false,
  `request_reverse_geo_code` boolean not null default false,
  key (`file`),
  foreign key (`file`) references `files`(`id`) on delete cascade
) Engine=innodb default charset utf8 collate utf8_unicode_ci;

create table file_details (
  `file` bigint unsigned not null,
  `identity` text,
  `metadata` text,
  key (`file`),
  foreign key (`file`) references `files`(`id`) on delete cascade
) Engine=innodb default charset utf8 collate utf8_unicode_ci;
