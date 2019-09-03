create table files (
  `id` serial primary key,
  `path` text not null,
  `name` text not null,
  `modified_at` timestamp not null,
  unique key `full_path` (`path`(255), `name`(255))
) Engine=innodb default charset utf8 collate utf8_unicode_ci;

create table file_flags (
  `file` bigint unsigned not null,
  `request_identify` boolean not null default false,
  `request_metadata` boolean not null default false,
  `request_reverse_geo_code` boolean not null default false,
  `request_tag` boolean not null default false,
  key (`file`),
  foreign key (`file`) references `files`(`id`) on delete cascade
) Engine=innodb default charset utf8 collate utf8_unicode_ci;

create table file_details (
  `file` bigint unsigned not null,
  `identity` text,
  `metadata` text,
  `geo` text,
  key (`file`),
  foreign key (`file`) references `files`(`id`) on delete cascade
) Engine=innodb default charset utf8 collate utf8_unicode_ci;

create table tags (
  `id` serial primary key,
  `name` varchar(255) not null,
  `type` varchar(255) not null,
  unique key (`name`)
) Engine=innodb default charset utf8 collate utf8_unicode_ci;

create table file_tags (
  `file` bigint unsigned not null,
  `tag` bigint unsigned not null,
  unique key `full_identifier` (`file`, `tag`),
  key (`file`),
  key (`tag`),
  foreign key (`file`) references `files`(`id`) on delete cascade,
  foreign key (`tag`) references `tags`(`id`) on delete cascade
) Engine=innodb default charset utf8 collate utf8_unicode_ci;
