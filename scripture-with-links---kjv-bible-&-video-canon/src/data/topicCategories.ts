import type { TopicCategory } from '../types/index.ts';

export const INITIAL_TOPIC_CATEGORIES: TopicCategory[] = [
  {
    id: 'cat-christology',
    name: 'Christology & The Triune God',
    description: 'The Person, nature, deity, incarnation, and eternal glory of the Lord Jesus Christ.',
    subcategories: [
      {
        id: 'sub-eternal-logos',
        parentCategoryId: 'cat-christology',
        name: 'The Eternal Word (Logos)',
        description: 'Exegesis of John 1, Colossians 1, and the pre-existence of Christ.',
        count: 1,
      },
      {
        id: 'sub-incarnation',
        parentCategoryId: 'cat-christology',
        name: 'The Incarnation & Virgin Birth',
        description: 'God manifest in the flesh, tabernacling among humanity.',
        count: 1,
      },
      {
        id: 'sub-atonement',
        parentCategoryId: 'cat-christology',
        name: 'Substitutionary Atonement & The Cross',
        description: 'Propitiation, the Suffering Servant of Isaiah 53, and redemption by His blood.',
        count: 2,
      },
      {
        id: 'sub-resurrection',
        parentCategoryId: 'cat-christology',
        name: 'Resurrection & Exaltation',
        description: 'The victory over death, ascension, and seated at the right hand of the Father.',
        count: 1,
      },
    ],
  },
  {
    id: 'cat-soteriology',
    name: 'Sovereignty, Grace & Salvation',
    description: 'The doctrines of divine grace, justification, eternal security, and the new birth.',
    subcategories: [
      {
        id: 'sub-new-birth',
        parentCategoryId: 'cat-soteriology',
        name: 'Regeneration & The New Birth',
        description: 'Except a man be born again (John 3), spiritual renewal by the Holy Ghost.',
        count: 1,
      },
      {
        id: 'sub-sola-fide',
        parentCategoryId: 'cat-soteriology',
        name: 'Justification by Faith (Sola Fide)',
        description: 'Ephesians 2:8-9, Romans 3-5, not of works lest any man should boast.',
        count: 1,
      },
      {
        id: 'sub-golden-chain',
        parentCategoryId: 'cat-soteriology',
        name: 'The Golden Chain of Redemption',
        description: 'Romans 8:28-30: Foreknown, predestined, called, justified, glorified.',
        count: 1,
      },
      {
        id: 'sub-assurance',
        parentCategoryId: 'cat-soteriology',
        name: 'Assurance & Inseparable Love',
        description: 'Nothing shall separate us from the love of God in Christ Jesus.',
        count: 1,
      },
    ],
  },
  {
    id: 'cat-covenant',
    name: 'Origins, Creation & Biblical Covenants',
    description: 'Genesis cosmology, covenant theology, types and shadows through Biblical history.',
    subcategories: [
      {
        id: 'sub-creation-ex-nihilo',
        parentCategoryId: 'cat-covenant',
        name: 'Genesis 1 & Sublime Creation',
        description: 'In the beginning God created heaven and earth; literary structure and fiat creation.',
        count: 1,
      },
      {
        id: 'sub-davidic-covenant',
        parentCategoryId: 'cat-covenant',
        name: 'Davidic Psalms & The Good Shepherd',
        description: 'Psalm 23, Psalm 91, the shepherd king and messianic protection.',
        count: 1,
      },
      {
        id: 'sub-law-gospel',
        parentCategoryId: 'cat-covenant',
        name: 'The Law and the Gospel',
        description: 'Moses, Sinai, and the fulfillment of righteousness in the New Covenant.',
        count: 0,
      },
    ],
  },
  {
    id: 'cat-christian-living',
    name: 'Christian Living & Love (Charity)',
    description: 'Practical discipleship, holy love, faith in trials, and spiritual fruitfulness.',
    subcategories: [
      {
        id: 'sub-agape-love',
        parentCategoryId: 'cat-christian-living',
        name: 'Agape Love & Charity (1 Cor 13)',
        description: 'The supreme way of love, patient and kind, never failing.',
        count: 1,
      },
      {
        id: 'sub-comfort-suffering',
        parentCategoryId: 'cat-christian-living',
        name: 'Comfort in Suffering & The Valley',
        description: 'Walking through the valley of the shadow of death with thy rod and staff.',
        count: 1,
      },
      {
        id: 'sub-wisdom-proverbs',
        parentCategoryId: 'cat-christian-living',
        name: 'Wisdom & Trust in the Lord',
        description: 'Trust in the Lord with all thine heart; lean not unto thine own understanding (Prov 3).',
        count: 0,
      },
    ],
  },
  {
    id: 'cat-eschatology',
    name: 'Prophecy & The Consummation',
    description: 'The prophets of the Old Testament and Revelation of Jesus Christ.',
    subcategories: [
      {
        id: 'sub-isaiah-prophecy',
        parentCategoryId: 'cat-eschatology',
        name: 'Messianic Prophecies in Isaiah',
        description: 'The Virgin Birth (Isa 7), the Prince of Peace (Isa 9), and the Holy One (Isa 6).',
        count: 1,
      },
      {
        id: 'sub-new-jerusalem',
        parentCategoryId: 'cat-eschatology',
        name: 'New Heaven, New Earth & Revelation 21',
        description: 'All tears wiped away, no more death, the holy city prepared as a bride.',
        count: 0,
      },
    ],
  },
];
