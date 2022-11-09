import { test, expect } from "@playwright/test";
import { Web3Storage, File } from "web3.storage";
import dotenv from "dotenv";
import { v4 } from "uuid";
import axios from "axios";
dotenv.config();

function getAccessToken() {
  return process.env.WEB3STORAGE_TOKEN || "";
}

// example from the docs: https://web3.storage/docs/how-tos/store/
function makeStorageClient() {
  return new Web3Storage({ token: getAccessToken() });
}

test("Demo showing basic use case of Web3 Storage", async () => {
  test.setTimeout(120000);
  const iterations = 10;
  const timing: Record<string, number>[] = [];
  const client = makeStorageClient();

  await Promise.all(
    Array(iterations)
      .fill(null)
      .map(async () => {
        const content = `Random content: ${v4()}`;
        const files = [new File([content], "plain-utf8.txt")];
        const ipfsUploadStart = performance.now();
        const cid = await client.put(files, { wrapWithDirectory: false });
        const upload = performance.now() - ipfsUploadStart;
        console.log("Time elapsed uploading", cid, "to IPFS:", upload); // 1s - 2s

        const fetch = async () => {
          const ipfsDownloadStart = performance.now();
          const firstFileBuffer = await axios
            .get(`https://${cid}.ipfs.w3s.link/plain-utf8.txt`, {
              responseType: "arraybuffer",
            })
            .then((r) => r.data as ArrayBuffer)
            .catch((e) => {
              console.error("Failed to fetch", cid);
              console.error(e.response.data.toString());
              return undefined;
            });
          const download = performance.now() - ipfsDownloadStart;
          console.log("Time elapsed downloading", cid, "from IPFS:", download);

          // sanity checking contents
          // const files = await response!.files();
          // const firstFileBuffer = await files[0].arrayBuffer();
          if (firstFileBuffer)
            expect(Buffer.from(firstFileBuffer).toString()).toEqual(content);
          return download;
        };

        const fetch1 = await fetch(); // anywhere between 5s - 20s
        const fetch2 = await fetch(); // under 500ms
        const fetch3 = await fetch(); // under 500ms
        timing.push({ upload, fetch1, fetch2, fetch3 });
      })
  );

  console.log(
    "Average upload speed:",
    timing.reduce((p, c) => p + c.upload, 0) / 10
  );
  console.log(
    "Average initial fetch speed:",
    timing.reduce((p, c) => p + c.fetch1, 0) / 10
  );
  console.log(
    "Average second fetch speed:",
    timing.reduce((p, c) => p + c.fetch2, 0) / 10
  );
  console.log(
    "Average third fetch speed:",
    timing.reduce((p, c) => p + c.fetch3, 0) / 10
  );
});
