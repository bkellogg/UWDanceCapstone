// list of chors
// list of dancers
// dancers that are not casted
// dancers that are csated and who they have been cast to
// conflicts (dancers that have casted to more than one chor)

chor_update = {
    rank1: ["p1", "p8"],
    rank2: ["p7", "p78"],
    rank3: ["p2", "p5"] 
}

server_response = {
    cast: [],
    contested: [contested],
    uncasted: [],
}

contested = {
    dancer: dancer,
    dancerNumPieces: 1 | 2,
    chors: [],
}

dancer = {
    user: user,
    numPieces: 1 || 2,
    avail: "their availability",
    auditionNum: int,
    notes: [notes]
}