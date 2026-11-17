# GTA VI Countdown Discord BOT

A lightweight Discord bot that maintains one countdown embed per server, with release and preload tracking, persistent message references and daily updates.

## Features

* Release and preload countdowns using calendar days in Europe/Warsaw.
* Automatic updates at startup and midnight, including daylight saving changes.
* Last updated date and time displayed in the embed.
* One persistent message per server, with channel relocation and deleted message recovery.
* Optional role mention above the embed.
* Private command confirmations and Manage Server permission checks.
* Local JSON storage with no database requirement.

## Requirements

Node.js 22.12 or newer, npm, internet access and a Discord bot application.

## Discord application setup

1. Open https://discord.com/developers/applications and create an application.
2. Open the Bot section and obtain a bot token.
3. Under Installation, configure Guild Install with the bot and applications.commands scopes.
4. Grant View Channel, Send Messages, Embed Links and Read Message History.
5. Use the installation link to add the bot to your server.
6. Ensure the same permissions apply on the selected channel.
7. For role notifications, make the role mentionable or grant the bot permission to mention it.

## Windows

Install Node.js LTS from https://nodejs.org and reopen your terminal.
Download and extract this repository, then open PowerShell in its directory.

~~~powershell
npm.cmd install
notepad .env
~~~

Create and save the .env file as described under Local configuration below.

~~~powershell
npm.cmd start
~~~

If Windows cannot find Node.js after installation, restart the terminal application.
If needed, add the default installation directory for the current session.

~~~powershell
$env:Path = "C:\Program Files\nodejs;$env:Path"
~~~

## Linux

Install Node.js 22.12 or newer using an official installation method suitable for your distribution.
Download and extract this repository, then open a terminal in its directory.

~~~bash
node --version
npm install
nano .env
~~~

Save the local configuration, then start the bot.

~~~bash
npm start
~~~

Keep the terminal session running, or use your preferred process manager for continuous hosting.

## Android with Termux

Install Termux using the installation guidance at https://github.com/termux/termux-app.
Install the dependencies.

~~~bash
pkg update
pkg install nodejs-lts unzip nano
termux-setup-storage
~~~

Allow file access when Android asks. Download the repository ZIP into Downloads.
Extract it into the Termux home directory, then enter the extracted project folder.
For example, after renaming the downloaded archive to project.zip:

~~~bash
unzip ~/storage/downloads/project.zip -d ~/
~~~

Use ls to find the extracted folder, then cd into it and run:

~~~bash
npm install
nano .env
npm start
~~~

Keep the Termux session open. Allow background activity in Android battery settings.
To help prevent the phone from sleeping while hosting, run termux-wake-lock before starting the bot.
Release it with termux-wake-unlock when you stop hosting. Android may still terminate background processes.

This repository uses the same Node.js entry point on every platform.
No separate phone scheduler is included.

## Local configuration

Open the included .env file in the project directory.
Open .env and paste your bot token immediately after DISCORD_TOKEN=, then save it.
Keep your existing .env when upgrading.
Set DISCORD_TOKEN to your own bot token.
Optionally set DISCORD_ROLE_ID to the ID of a role to mention above the embed.
Leave DISCORD_ROLE_ID unset to disable mentions.

The included .env contains empty values. Never commit your populated .env.
When working in a Git clone, run git rm --cached .env before filling it in and commit that removal. The existing .gitignore then excludes your local credentials.
Keep the bot token private.

## Usage

Start the bot and wait for Counter ready.
Use /setcounter gta6 to publish in the current channel.
The optional channel parameter selects another text or announcement channel.
The command requires Manage Server permission.

The bot registers the global slash command at startup.
If it does not appear immediately, allow Discord time to refresh its command list.

Press Ctrl+C to stop the bot. In Termux, Volume Down+C also sends Ctrl+C.
Restart it after changing code or configuration.

## Dates and embed content

config.json contains release, preload and source.
Dates use YYYY-MM-DD format. The included dates are configurable project values.
Confirm actual release and preload availability with Rockstar Games before deployment.

counter.js controls the title, colours, fields and footer.
Before release, the embed displays the remaining calendar days.
On release day it displays Today is the day, and afterwards it displays a released message.
The preload field switches to an availability message on its configured date.
Last updated records the time the embed was generated, shown in Europe/Warsaw.

## Storage and updates

counters.json stores server, channel and message IDs.
Preserve this file and your .env when upgrading or moving the bot.
Install dependencies again on the new device instead of copying node_modules.
Run only one bot instance per data directory.

The bot edits its existing message at startup and midnight.
Edits do not send another role notification. A recreated message may notify the configured role.
A deleted message is recreated while the bot is running, or at the next startup.
Missing channels and permissions are logged so other servers can continue updating.

For a single refresh followed by disconnection:

~~~bash
npm start -- --once
~~~

Configure the counter in normal mode first. One-shot mode does not schedule future updates.

## Project structure

* bot.js handles Discord interactions, scheduling and persistence.
* counter.js formats the countdown embed.
* config.json stores the configured dates and source URL.
* package.json defines runtime dependencies and the start command.

## Design and limitations

Per-server queues serialize command and scheduled updates.
State is written to a temporary file and renamed to reduce partial writes.
A crash between sending a replacement message and saving its ID can leave an untracked message.
Local JSON storage is intended for a single running instance.

The project has been checked for JavaScript syntax and countdown transitions at Warsaw midnight.
Live Discord behaviour requires a configured bot token and server permissions.

## Troubleshooting

If startup reports that .env is missing, create it in the project directory.
For an invalid token error, replace the value locally with the current bot token.
For permission errors, check both the bot role and channel overrides.
If an embed stays unchanged, confirm that the updated code is on the device running the bot and restart it.
On Android, inspect Termux for errors if background updates stop.

## Attribution

Grand Theft Auto and GTA VI belong to Rockstar Games.
This is an independent fan project built to demonstrate Discord interaction handling,
timezone-aware scheduling and persistent message updates.
