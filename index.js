import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

await oAuth2Client.refreshAccessToken();

const youtube = google.youtube({ version: "v3", auth: oAuth2Client });

const result = await youtube.videos.list({
  part: ["snippet", "statistics"],
  id: [process.env.VIDEO_ID],
});

const video = result.data.items?.[0];
const viewCount = video?.statistics?.viewCount;

if (!viewCount) {
  console.log("Can't get view count");
  process.exit(1);
}

await youtube.videos.update({
  part: ["snippet"],
  requestBody: {
    id: process.env.VIDEO_ID,
    snippet: {
      title: `Only ${Intl.NumberFormat("en-US").format(
        Number(viewCount)
      )} views...`,
      categoryId: 28,
    },
  },
});

console.log("Updated video title successfully");
