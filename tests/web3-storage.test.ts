import { test, expect } from "@playwright/test";
import { Web3Storage, File } from "web3.storage";
import dotenv from "dotenv";
dotenv.config();

function getAccessToken() {
  return process.env.WEB3STORAGE_TOKEN || "";
}

// example from the docs: https://web3.storage/docs/how-tos/store/
function makeStorageClient() {
  return new Web3Storage({ token: getAccessToken() });
}

function makeFileObjects() {
  const obj = { hello: "world" };

  const files = [new File(["contents-of-file-1"], "plain-utf8.txt")];
  return files;
}

test("Demo showing basic use case of Web3 Storage", async () => {
  test.setTimeout(60000);

  const client = makeStorageClient();
  const ipfsUploadStart = performance.now();
  const cid = await client.put(makeFileObjects(), { wrapWithDirectory: false });
  console.log(
    "Time to upload data to IPFS:",
    performance.now() - ipfsUploadStart
  ); // 1s - 2s

  const fetch = async () => {
    const ipfsDownloadStart = performance.now();
    const response = await client.get(cid);
    console.log(
      "Time to download data from IPFS:",
      performance.now() - ipfsDownloadStart
    );

    // sanity checking contents
    const files = await response!.files();
    const firstFileBuffer = await files[0].arrayBuffer();
    expect(Buffer.from(firstFileBuffer!).toString()).toEqual(
      "contents-of-file-1"
    );
  };

  await fetch(); // anywhere between 2s - 25s
  await fetch(); // under 500ms
  await fetch(); // under 500ms
});
