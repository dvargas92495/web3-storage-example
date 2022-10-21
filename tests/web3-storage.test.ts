import { test, expect } from "@playwright/test";
import { Web3Storage, File } from "web3.storage";
import dotenv from "dotenv";
import { v4 } from "uuid";
dotenv.config();

function getAccessToken() {
  return process.env.WEB3STORAGE_TOKEN || "";
}

// example from the docs: https://web3.storage/docs/how-tos/store/
function makeStorageClient() {
  return new Web3Storage({ token: getAccessToken() });
}

test("Demo showing basic use case of Web3 Storage", async () => {
  test.setTimeout(60000);

  const client = makeStorageClient();
  const content = `Random content: ${v4()}`;
  const files = [new File([content], "plain-utf8.txt")];
  const ipfsUploadStart = performance.now();
  const cid = await client.put(files, { wrapWithDirectory: false });
  console.log(
    "Time elapsed uploading",
    cid,
    "to IPFS:",
    performance.now() - ipfsUploadStart
  ); // 1s - 2s

  const fetch = async () => {
    const ipfsDownloadStart = performance.now();
    const response = await client.get(cid);
    console.log(
      "Time elapsed downloading",
      cid,
      "from IPFS:",
      performance.now() - ipfsDownloadStart
    );

    // sanity checking contents
    const files = await response!.files();
    const firstFileBuffer = await files[0].arrayBuffer();
    expect(Buffer.from(firstFileBuffer!).toString()).toEqual(content);
  };

  await fetch(); // anywhere between 5s - 20s
  await fetch(); // under 500ms
  await fetch(); // under 500ms
});
