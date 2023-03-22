#!/usr/bin/env node
import { mkdir, appendFile, readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const [inputFilePath, outputDir, linesQtyString] = process.argv.slice(2);
const outputDirPath = "output";

if (!inputFilePath) {
  console.error("Input file is required, usage: npx-blocks-into-txt <input-file-path> <output-dir> <lines-qty>");
  process.exit(1);
}

if (!outputDir) {
  console.error("Output dir is required, usage: npx-blocks-into-txt <input-file-path> <output-dir> <lines-qty>");
  process.exit(1);
}

if (isNaN(linesQtyString)) {
  console.error("The lines-qty should be an integer");
  process.exit(1);
}

if (!existsSync(inputFilePath)) {
  console.error("Input file path does not exists");
  process.exit(1);
}

if (!(await existsSync(outputDirPath))) {
  await mkdir(outputDirPath);
}

async function log(message) {
  console.log(message);
  await appendFile("log.txt", `${message}\r\n`);
}

const linesQty = Number(linesQtyString);
const fileContent = await readFile(inputFilePath, "utf8");
const fileLines = fileContent.replaceAll("\r", "").split("\n");

const blocks = [];

for (let index = 0; index < fileLines.length; index += linesQty + 1) {
  const currentBlock = fileLines.slice(index, index + linesQty);
  blocks.push(currentBlock);
}

let blockCount = 0;

for (let block of blocks) {
  const fileName = block[0]
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, " ")
    .trim();

  if (!fileName && blockCount !== blocks.length - 1) {
    throw new Error(`Blocks should have a title as the 1st line, block index: ${blockCount}`);
    process.exit(1);
  }

  const filePath = path.join(outputDirPath, `${fileName}.txt`);
  const fileContent = block.join("\r\n");

  await writeFile(filePath, fileContent);
  blockCount++;
  await log(`Block ${blockCount} of ${blocks.length} written to file: ${fileName}.txt`);
}

await log(`Finished writing ${blockCount} blocks to files.`);
