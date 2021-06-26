# DDL Extension for StarUML

This extension for StarUML (http://staruml.io) support to generate DDL (Data Definition Language) from ERD. Install this extension from Extension Manager of StarUML.

## 修改说明

新增功能:
1. [DDL SQL生成功能优化](#DDL(模型))

  - 新增 dbms:NEW MYSQL
  - Entity 的名称需要符合以下格式：full_table_name(short_table_name table_cn_name)
  - Entity 的 column 的 name 命名需要符合以下格式: full_column_name column_cn_name
  - 不会生成外键语句
  - 增加属性注释和表注释

2. [ER图中根据定义JSON文件为Entity生成Column](#为Entity添加默认Columns)

3. [根据CREATE SQL生成DataModel](#dataModel生成)

### DDL(模型 => SQL)

#### DDL快捷键

`cmdctrl+g` 激活 ddl 插件

#### DDL功能只有 dbms 为 NEW MYSQL 才会生效

![where_new_sql_1](https://raw.githubusercontent.com/fuzi1996/pictbed/master/whereIs.png)

![where_new_sql_2](https://raw.githubusercontent.com/fuzi1996/pictbed/master/show.png)

#### 示例

1. ER 图示例在`./example`文件夹下[产品设计ER图](./example/product.mdj)

![ER图示例](https://raw.githubusercontent.com/fuzi1996/pictbed/master/mdj_show.png)

2. 生成的 SQL 语句为:

```SQL
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `product`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `product` (
    `code` VARCHAR(50) NOT NULL COMMENT '产品代码',
    `name` VARCHAR(300) NOT NULL COMMENT '产品名称',
    `price` DECIMAL(19,4) COMMENT ' 产品价格',
    `start_date` date COMMENT '成立日',
    `end_date` date COMMENT '到期日',
    `desc` VARCHAR(1500) COMMENT '产品描述',
    PRIMARY KEY (`code`),
    UNIQUE (`name`)
) COMMENT '产品信息';
```

### 为Entity添加默认Columns

**ER图中根据定义JSON文件为Entity生成Column**

#### AddColumns 快捷键

选中`Entity` -> `cmdctrl+a` 激活 addColumns 插件

![whatIsEntity.png](https://raw.githubusercontent.com/fuzi1996/pictbed/master/whatIsEntity.png)

#### 修改默认的Column

- MacOS: ~/Library/Application Support/StarUML/extensions/user/staruml-ddl-v2/column-define.json
- Windows: C:\Users\<user>\AppData\Roaming\StarUML\extensions\user\staruml-ddl-v2\column-define.json
- Linux: ~/.config/StarUML/extensions/user/staruml-ddl-v2/column-define.json

```js
{
    "name":"version 乐观锁",
    "type":"INTEGER",
    "length":"0",
    "primaryKey":false,
    "foreignKey":false,
    "nullable":false,
    "unique":false,
    "documentation":"乐观锁"
}
```

### DataModel生成

- `Tools` -> `DDL` -> `Generate DataModel` 
![whereDataModelGenerate.png](https://raw.githubusercontent.com/fuzi1996/pictbed/master/whereDataModelGenerate.png)

- Enter Create SQL,like 

```sql 
CREATE TABLE `mf_fd_cache` (
  `id` bigint(18) NOT NULL AUTO_INCREMENT,
  `dep` varchar(3) NOT NULL DEFAULT '',
  `arr` varchar(3) NOT NULL DEFAULT '',
  `flightNo` varchar(10) NOT NULL DEFAULT '',
  `flightDate` date NOT NULL DEFAULT '1000-10-10',
  `flightTime` varchar(20) NOT NULL DEFAULT '',
  `isCodeShare` tinyint(1) NOT NULL DEFAULT '0',
  `tax` int(11) NOT NULL DEFAULT '0',
  `yq` int(11) NOT NULL DEFAULT '0',
  `cabin` char(2) NOT NULL DEFAULT '',
  `ibe_price` int(11) NOT NULL DEFAULT '0',
  `ctrip_price` int(11) NOT NULL DEFAULT '0',
  `official_price` int(11) NOT NULL DEFAULT '0',
  `uptime` datetime NOT NULL DEFAULT '1000-10-10 10:10:10',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uid` (`dep`,`arr`,`flightNo`,`flightDate`,`cabin`),
  KEY `uptime` (`uptime`),
  KEY `flight` (`dep`,`arr`),
  KEY `flightDate` (`flightDate`)
) ENGINE=InnoDB  DEFAULT CHARSET=gbk;

-- or --

CREATE TABLE `product` (
    `code` VARCHAR(50) NOT NULL COMMENT '产品代码',
    `name` VARCHAR(300) NOT NULL COMMENT '产品名称',
    `price` DECIMAL(19,4) COMMENT ' 产品价格',
    `start_date` date COMMENT '成立日',
    `end_date` date COMMENT '到期日',
    `desc` VARCHAR(1500) COMMENT '产品描述',
    PRIMARY KEY (`code`),
    UNIQUE (`name`)
) COMMENT '产品信息';
```

![normal-sql-generate-datamodel.png](https://raw.githubusercontent.com/fuzi1996/pictbed/master/normal-sql-generate-datamodel.png)

![cn-name-generate-dataModel.png](https://raw.githubusercontent.com/fuzi1996/pictbed/master/cn-name-generate-dataModel.png)



Thanks [@niklauslee](https://github.com/niklauslee)

**以下为原始说明**

## How to use

1. Click the menu (`Tools > DDL > Generate DDL...`)
2. Select a data model that will be generated to DDL.
3. Save the generated DDL to a file.

## Generation rules

Belows are the rules to convert from ERD elements to DDL.

- All entities and columns are converted to create table statements as follow:

```sql
CREATE TABLE entity1 (
    col1 INTEGER,
    col2 VARCHAR(20),
    ...
);
```

- Primary keys are converted as follow:

```sql
CREATE TABLE entity1 (
    pk1 INTEGER,
    pk2 VARCHAR(10),
    ...
    PRIMARY KEY (pk1, pk2, ...)
);
```

- Not-nullable columns are converted as follow:

```sql
CREATE TABLE entity1 (
    col1 VARCHAR(20) NOT NULL,
    ...
);
```

- Unique columns are converted as follow:

```sql
CREATE TABLE entity1 (
    ...
    UNIQUE (col1, col2, ...)
);
```

- Foreign keys are converted as follow:

```sql
CREATE TABLE entity1 (
    fk1 INTEGER,
    ...
);
...

ALTER TABLE entity1 ADD FOREIGN KEY (fk1) REFERENCES entity2(col1);
```

- If `Quote Identifiers` option is selected, all identifiers will be surrounded by a backquote character.

```sql
CREATE TABLE `entity1` (
    `col1` INTEGER,
    `col2` VARCHAR(20),
    ...
);
```

- If `Drop Tables` option is selected, drop table statements will be included.

(**MySQL** selected in `DBMS` option)

```sql
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS entity1;
...
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE entity1 (...);
...
```

(**Oracle** selected in `DBMS` option)

```sql
DROP TABLE entity1 CASCADE CONSTRAINTS;`
...

CREATE TABLE entity1 (...);
...
```

## Contributions

Any contributions are welcome. If you find a bug or have a suggestion, please post as an issue.
