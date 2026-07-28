/*
  Warnings:

  - You are about to drop the column `assumptionsDefault` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `document` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `objectivesDefault` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `outOfScopeDefault` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `overviewDefault` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `scopeDefault` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `termsDefault` on the `Template` table. All the data in the column will be lost.
  - Added the required column `jsonSchema` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sow" ADD COLUMN     "formAnswers" JSONB;

-- AlterTable
ALTER TABLE "Template" DROP COLUMN "assumptionsDefault",
DROP COLUMN "document",
DROP COLUMN "objectivesDefault",
DROP COLUMN "outOfScopeDefault",
DROP COLUMN "overviewDefault",
DROP COLUMN "scopeDefault",
DROP COLUMN "termsDefault",
ADD COLUMN     "defaultValues" JSONB,
ADD COLUMN     "jsonSchema" JSONB NOT NULL,
ADD COLUMN     "uiSchema" JSONB;
