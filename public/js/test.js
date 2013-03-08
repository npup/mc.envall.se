function build(step, heading, formContent) {
  return [
    heading ? ("<p>"+heading+"</p>") : ""
    , "<form action=#"+step+">"].concat(
      formContent
    ).concat([
      "</form>"
    ])
  ];
}

return {
  "start": build("start", "Skriv ditt namn", [
      "<label for=nick>Nick </label>"
      , "<input type=text name=nick id=nick autofocus/>"
      , "<input type=submit />"
    ])
  , "options": build("options", "Välj...", [
      "<label for=nick>Nick </label>"
      , "<input type=text name=nick id=nick autofocus/>"
      , "<input type=submit />"
    ])
  }
};
