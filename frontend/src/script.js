import PromptSync from "prompt-sync";

console.error("Wrong input");
console.warn("Please enter 8 characters");
console.log("Done!")

const prompt = PromptSync()

const v = prompt("Type something:")

console.log(v);
