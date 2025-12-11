-- AlterTable
ALTER TABLE `product` ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `image` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `postalCode` VARCHAR(191) NULL,
    ADD COLUMN `telephone` VARCHAR(191) NULL;
