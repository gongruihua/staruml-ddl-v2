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
