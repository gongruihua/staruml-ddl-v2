# DDL Extension for StarUML

This extension for StarUML (http://staruml.io) support to generate DDL (Data Definition Language) from ERD. Install this extension from Extension Manager of StarUML.

## 修改说明

### 新增快捷键

`cmdctrl+g` 激活 ddl 插件

### 以下改动只有 dbms 为 NEW MYSQL 才会生效

1. 新增 dbms:NEW MYSQL
2. Entity 的名称需要符合以下格式：full_table_name(short_table_name table_cn_name)
3. Entity 的 column 的 name 命名需要符合以下格式: full_column_name column_cn_name
4. 不会生成外键语句
5. 增加属性注释和表注释

### 示例
1. ER 图示例在`./example`文件夹下[产品设计ER图](./example/product.mdj)
2。 生成的 SQL 语句为:

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
