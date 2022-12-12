// Secrets
const { reddit, discord } = require("./secrets.json");

// Axios for get requests
const axios = require("axios");

// Reddit api setup
const { SubmissionStream } = require("snoostorm");
const Snoowrap = require("snoowrap");
const rclient = new Snoowrap(reddit);

// Discord api setup
const { Client, Intents, MessageEmbed } = require("discord.js");
const intents = new Intents();
intents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES);
const dclient = new Client({
  intents: intents,
});

dclient.login(discord.token);
// Log to the console if bot was enabled
dclient.on("ready", async () => {
  console.log(`${dclient.user.tag} is online!`);
  dclient.user.setActivity("Dislyte", {
    type: "PLAYING",
  });
});

const submissionEvent = new SubmissionStream(rclient, {
  subreddit: "Dislyte",
  limit: 10,
  pollTime: 2000,
});

submissionEvent.on("item", async (post) => {
  const flair = "Info";
  if (post.link_flair_text != flair) return;
  if (post.title.endsWith("?")) return;

  const pastelPurple = 0xb1a2ca;
  const embed = new MessageEmbed()
    .setTitle(post.title)
    .setURL(post.url)
    .setColor(pastelPurple)
    .setTimestamp();

  if (post.is_video) embed.setImage(post.media.oembed.thumbnail_url);
  if (isImage(post.url)) embed.setImage(post.url);
  if (post.is_self) embed.setDescription(post.selftext);
  if (post.author_name) {
    embed.setAuthor({
      name: post.author_name,
    });
  }

  dclient.channels
    .fetch(discord.updateChannel)
    .then((ch) => ch.send({ embeds: [embed] }));
});

async function isImage(url) {
  const headers = await axios.get(url).then(res.headers);
  return headers["content-type"].startsWith("image");
}
