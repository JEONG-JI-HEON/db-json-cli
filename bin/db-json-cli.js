#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { startServer } from "../src/server.js";

const argv = yargs(hideBin(process.argv))
  .option("port", {
    alias: "p",
    type: "number",
    default: 4000,
    description: "Port to run the server on",
  })
  .option("db", {
    alias: "d",
    type: "string",
    default: "./db.json",
    description: "Path to JSON database file",
  })
  .option("watch", {
    alias: "w",
    type: "boolean",
    default: false,
    description: "Watch DB file for changes",
  })
  .help().argv;

if (argv.watch) process.env.WATCH = "true";

startServer(argv.db, argv.port);
