
const PEG = require("pegjs");
const grammar = `
Start
= i:Integer_ "mins" _ "ago" {
  return new Date(Date.now() - i*60*1000)
}
Integer "integer"
= _ [0-9]+ {
  return parseInt(text(), 10)
}

_ "whitespace"
= [ ]*
`;
const parser = PEG.generate(grammar);
const result = parser.parse(process.argv[2]);
console.log(result)

