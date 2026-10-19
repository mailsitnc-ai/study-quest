// Starter content. Your own notes go in via the ⚒ Forge tab (paste notes -> instant region),
// or tell Claude to write decks here. Card: { q, a, topic?, wrong?: [..], note?: "why" }
window.DECKS = [
  {
    id: "starter", name: "Starter Realm", emoji: "🏰",
    cards: [
      { q: "Powerhouse of the cell?", a: "Mitochondria", topic: "Biology", note: "Makes ATP via respiration" },
      { q: "Organelle where photosynthesis happens?", a: "Chloroplast", topic: "Biology" },
      { q: "Molecule that carries genetic code?", a: "DNA", topic: "Biology" },
      { q: "Process of cell division producing 2 identical cells?", a: "Mitosis", topic: "Biology" },
      { q: "Pigment that makes plants green?", a: "Chlorophyll", topic: "Biology" },
      { q: "Time complexity of binary search?", a: "O(log n)", wrong: ["O(n)", "O(n log n)", "O(1)"], topic: "Algorithms" },
      { q: "Data structure that works first-in first-out?", a: "Queue", topic: "Algorithms" },
      { q: "Data structure that works last-in first-out?", a: "Stack", topic: "Algorithms" },
      { q: "Worst-case time of quicksort?", a: "O(n²)", wrong: ["O(n log n)", "O(n)", "O(log n)"], topic: "Algorithms" },
      { q: "Traversal that visits a node's neighbours first?", a: "Breadth-first search", topic: "Algorithms" },
      { q: "OSI layer that handles routing?", a: "Network layer", topic: "Networks" },
      { q: "Protocol that resolves domain names to IPs?", a: "DNS", topic: "Networks" },
      { q: "Reliable, connection-oriented transport protocol?", a: "TCP", topic: "Networks" },
      { q: "Port used by HTTPS?", a: "443", topic: "Networks" },
      { q: "Derivative of x²?", a: "2x", topic: "Maths" },
      { q: "Integral of 1/x?", a: "ln|x| + C", topic: "Maths" }
    ]
  }
];
