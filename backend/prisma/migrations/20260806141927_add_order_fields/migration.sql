-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `OrderItem_orderId_fkey`;

-- DropIndex
DROP INDEX `OrderItem_orderId_fkey` ON `orderitem`;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `courier` VARCHAR(191) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `grandTotal` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `notes` VARCHAR(191) NULL,
    ADD COLUMN `paymentMethod` VARCHAR(191) NULL,
    ADD COLUMN `postalCode` VARCHAR(191) NULL,
    ADD COLUMN `recipientName` VARCHAR(191) NULL,
    ADD COLUMN `shippingCost` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `telephone` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `totalPrice` INTEGER NOT NULL DEFAULT 0;

-- AlterTable: tambah kolom sebagai nullable dulu agar bisa di-backfill
ALTER TABLE `orderitem` ADD COLUMN `price` INTEGER NULL,
    ADD COLUMN `productName` VARCHAR(191) NULL;

-- Backfill data lama dari tabel Product
UPDATE `orderitem` oi
INNER JOIN `Product` p ON p.id = oi.productId
SET oi.price = p.price, oi.productName = p.name;

-- Jaga-jaga: isi nilai default untuk baris tanpa product (seharusnya tidak ada)
UPDATE `orderitem` SET price = COALESCE(price, 0), productName = COALESCE(productName, 'Produk') WHERE price IS NULL OR productName IS NULL;

-- Ubah jadi NOT NULL
ALTER TABLE `orderitem` MODIFY `price` INTEGER NOT NULL,
    MODIFY `productName` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `ContactMessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NULL,
    `message` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
