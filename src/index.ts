import Config from "./config/index.js";
import DataHandler from "./DataHandler.js";
import { Client, type ExecuteWebhookOptions } from "oceanic.js";
import { EmbedBuilder } from "@oceanicjs/builders";
import { Octokit } from "@octokit/rest";
import StatusServer, { type AnyServer } from "@uwu-codes/status-server";

const [owner, repo] = "Discord-Datamining/Discord-Datamining".split("/");

const octo = new Octokit({
    auth:      Config.githubToken,
    userAgent: "Datamining/1.0.0 (+https://github.com/OceanicJS/DataminingBot)"
});
const client = new Client({
    auth: Config.token
});

async function getCommits() {
    return (await octo.rest.repos.listCommits({
        owner,
        repo
    })).data.filter(c => c.commit.comment_count > 0);
}

async function getCommitComments(commit_sha: string) {
    return (await octo.rest.repos.listCommentsForCommit({
        owner,
        repo,
        commit_sha
    })).data;
}

function parseImages(body: string) {
    return Array.from(body.matchAll(/!\[[^\]]*]\((?<filename>.*?)?\)/g)).map(m => m.groups!.filename);
}

interface Commit {
    author: {
        icon: string;
        name: string;
        url: string;
    };
    description: string;
    title: string;
    url: string;
}

function makeEmbed(commit: Commit) {
    return new EmbedBuilder()
        .setAuthor(commit.author.name, commit.author.icon, commit.author.url)
        .setDescription(commit.description.length > 2048 ? `${commit.description.slice(0, 2045)}...` : commit.description)
        .setTitle(commit.title)
        .setURL(commit.url)
        .setTimestamp(new Date().toISOString())
        .setColor(0x7289DA)
        .toJSON();
}

async function executeWebhook(options: ExecuteWebhookOptions) {
    await client.rest.webhooks.execute(Config.webhook.id, Config.webhook.token, options);
}

export async function run() {
    const processedComments: Array<number> = [];
    const commits = await getCommits();
    for (const commit of commits.reverse()) {
        const title = commit.commit.message.split("\n")[0];
        const comments = await getCommitComments(commit.sha);
        for (const comment of comments) {
            processedComments.push(comment.id);
            if (await DataHandler.has(comment.id)) {
                continue;
            }
            await executeWebhook({
                embeds: [makeEmbed({
                    author: {
                        icon: comment.user!.avatar_url,
                        name: comment.user!.login,
                        url:  comment.user!.html_url
                    },
                    description: comment.body,
                    title,
                    url:         comment.html_url
                })]
            });
            const images = parseImages(comment.body);
            for (const image of images) {
                await executeWebhook({
                    content: image
                });
            }
        }
    }
    await DataHandler.write(processedComments);
}

await run();
const it = setInterval(run, 60_000 * 5);

process.on("unhandledRejection", (err, promise) => console.error("Unhandled Rejection:", err, promise))
    .on("uncaughtException", err => console.error("Uncaught Exception:", err))
    .once("SIGINT", () => {
        clearInterval(it);
        statusServer?.close();
        process.kill(process.pid, "SIGINT");
    })
    .once("SIGTERM", () => {
        clearInterval(it);
        statusServer?.close();
        process.kill(process.pid, "SIGTERM");
    });

let statusServer: AnyServer | undefined;

if (Config.isDocker) {
    statusServer = StatusServer(() => true);
}

console.log("Ready");
