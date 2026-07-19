export interface TrailerScene {
  id: number;
  image: string;
  text: string;
  textFilipino?: string;
  duration: number;
  animation: 'zoom' | 'pan-left' | 'pan-right' | 'pan-up' | 'dolly-in' | 'dolly-out' | 'shake' | 'live-2d' | 'parallax' | 'impact';
}

export interface SagaPart {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  descriptionFilipino?: string;
  scenes: TrailerScene[];
  status: 'Released' | 'Upcoming' | 'In Production';
}

export interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: any;
  parentId: string | null;
  likes: number;
  repliesCount?: number;
}

export interface VideoStats {
  viewCount: number;
  likes: number;
}

export const SAGA_METADATA = {
  title: "Usagyuuun N Friends",
  creator: "Usagyuun VTuber",
  adminEmail: "mdv4244@gmail.com",
  gcashPrice: 250,
  paypalPrice: 5,
};

export const SAGA_DATA: SagaPart[] = [
  {
    id: 1,
    title: "The Divine Calling",
    subtitle: "PART 1: THE INVITATION",
    description: "Our epic saga begins with the creation of the heavens. In the pure cosmic skies, Usagyuuun hears a whisper from Yahuah, our Creator, inviting them on a journey of eternal glory.",
    descriptionFilipino: "Nagsisimula ang ating epiko sa paglikha ng kalangitan. Sa ilalim ng payapang cosmic skies, narinig ni Usagyuuun ang bulong mula kay Yahuah, ang ating Manlilikha.",
    status: 'Released',
    scenes: [
      { id: 1, image: "/src/assets/images/cosmic_nebula_background_1784343251961.jpg", text: "In the infinite love of Yahuah, the cosmos hummed a sweet melody...", textFilipino: "Sa walang hanggang pag-ibig ni Yahuah, ang uniberso ay umawit ng isang matamis na himig...", duration: 12, animation: 'zoom' },
      { id: 2, image: "/src/assets/images/usagyuuun_pure_face_1784343854659.jpg", text: "A whisper of faith called Usagyuuun to step out of the ordinary.", textFilipino: "Isang bulong ng pananampalataya ang tumawag kay Usagyuuun upang lumabas sa karaniwan.", duration: 12, animation: 'dolly-in' },
      { id: 3, image: "/src/assets/images/nekogyuuun_pure_face_1784343869158.jpg", text: "Together with Nekogyuuun, they vowed to follow where Yahusha leads.", textFilipino: "Kasama si Nekogyuuun, sumumpa silang susunod kung saan sila dadalhin ni Yahusha.", duration: 12, animation: 'pan-up' }
    ]
  },
  {
    id: 2,
    title: "The Companion we Met",
    subtitle: "PART 2: FIRST LOVE Under the Stars",
    description: "In the peaceful valley of Eden Nebulae, the group meets a beautiful, pure-hearted bunny with pearlescent eyes. A gentle, calming connection of innocent love blooms, destined by Heaven.",
    descriptionFilipino: "Sa mapayapang lambak ng Eden Nebulae, nakatagpo ng grupo ang isang magandang kuneho na may kumikinang na mga mata. Isang tapat at dalisay na pag-ibig ang sumibol.",
    status: 'Released',
    scenes: [
      { id: 1, image: "/src/assets/images/legacy_young_bunny_p7_1784344613295.jpg", text: "Under the celestial canopy, they met Hana—a pure, radiating soul of light.", textFilipino: "Sa ilalim ng kalangitan, nakilala nila si Hana—isang dalisay na kaluluwa ng liwanag.", duration: 12, animation: 'live-2d' },
      { id: 2, image: "/src/assets/images/usagyuuun_pure_face_1784343854659.jpg", text: "An unspoken connection grew. 'I was sent by grace to find you,' she whispered.", textFilipino: "Isang tahimik na ugnayan ang lumago. 'Ipinadala ako ng biyaya upang mahanap ka,' bulong niya.", duration: 12, animation: 'dolly-out' },
      { id: 3, image: "/src/assets/images/marukuma_pure_face_1784343882264.jpg", text: "Even big Marukuma felt the sacred warmth of love and destiny.", textFilipino: "Kahit ang malaking si Marukuma ay naramdaman ang sagradong init ng pag-ibig at tadhana.", duration: 10, animation: 'zoom' }
    ]
  },
  {
    id: 3,
    title: "Shadows of Temptation",
    subtitle: "PART 3: THE BETRAYAL",
    description: "The path of faith is tested. Under the pressure of a terrifying dark entity, Ninjin falls prey to doubt and whispering demons, agreeing to betray his beloved friends for power.",
    descriptionFilipino: "Nasubok ang landas ng pananampalataya. Dahil sa takot sa madilim na pwersa, nagpadaig si Ninjin sa pagdududa at ipinagkanulo ang kanyang mga mahal sa buhay.",
    status: 'Released',
    scenes: [
      { id: 1, image: "/src/assets/images/ninjin_pure_face_1784343893471.jpg", text: "Whispers of the ancient serpent crawled into Ninjin's heart, promising fake crowns.", textFilipino: "Ang mga bulong ng lumang ahas ay gumapang sa puso ni Ninjin, nangangako ng huwad na korona.", duration: 12, animation: 'zoom' },
      { id: 2, image: "/src/assets/images/ninjin_ascension_p2_1784344474848.jpg", text: "Blinded by false glory, he made a dark covenant to surrender Hana.", textFilipino: "Nabulag sa huwad na kaluwalhatian, gumawa siya ng madilim na kasunduan upang isuko si Hana.", duration: 12, animation: 'pan-left' },
      { id: 3, image: "/src/assets/images/squad_vs_shadows_p2_1784344487784.jpg", text: "An ambush in the dead of night. Betrayed by the one they trusted most.", textFilipino: "Isang ambush sa kalaliman ng gabi. Ipinagkanulo ng mismong pinagkakatiwalaan nila.", duration: 10, animation: 'shake' }
    ]
  },
  {
    id: 4,
    title: "Terrors of the Void",
    subtitle: "PART 4: SPIRITUAL HORROR & SUSPENSE",
    description: "An intense, chilling darkness is unleashed. Terrifying demons tear through the dimensions, hunting the remaining friends while holding Hana captive. True suspense and horror.",
    descriptionFilipino: "Isang matinding kadiliman ang pinakawalan. Ang mga demonyo ay gumabay sa buong dimensyon, tinutugis ang mga kaibigan habang binihag si Hana.",
    status: 'Released',
    scenes: [
      { id: 1, image: "/src/assets/images/mechanical_beast_p3_1784344510817.jpg", text: "The sky bled crimson as demonic beasts of the abyss hunted them ruthlessly.", textFilipino: "Dumanak ang dugo sa kalangitan habang marahas silang tinutugis ng mga demonyo ng kalaliman.", duration: 12, animation: 'shake' },
      { id: 2, image: "/src/assets/images/usagyuuun_portal_jump_1784343291031.jpg", text: "Desperately leaping through rifts, the remaining friends ran for their lives.", textFilipino: "Desperadong tumalon sa mga bitak, tumakbo ang natitirang magkakaibigan para sa kanilang buhay.", duration: 10, animation: 'pan-right' },
      { id: 3, image: "/src/assets/images/dark_eclipse_star_p8_1784344626155.jpg", text: "The dark eclipse swallowed the stars. Hana was taken. Despair was absolute.", textFilipino: "Nilamon ng madilim na kupas ang mga bituin. Kinuha si Hana. Ang kawalan ng pag-asa ay lubos.", duration: 12, animation: 'zoom' }
    ]
  },
  {
    id: 5,
    title: "Tears in the Wilderness",
    subtitle: "PART 5: THE ANTI-CLIMAX",
    description: "Hana is gone, and the betrayal has broken the group. Usagyuuun weeps bitterly on the desolate mountain of grief. Every heart breaks as all hope seems completely lost.",
    descriptionFilipino: "Wala na si Hana, at ang pagkakanulo ay nagwasak sa grupo. Umiyak nang mapait si Usagyuuun sa bundok ng pighati. Lahat ay makakaramdam ng matinding kalungkutan.",
    status: 'Released',
    scenes: [
      { id: 1, image: "/src/assets/images/marukuma_forest_p3_1784344499014.jpg", text: "In the cold wilderness, Usagyuuun fell to his knees, weeping for his lost love.", textFilipino: "Sa malamig na ilang, lumuhod si Usagyuuun, umiiyak para sa kanyang nawalang pag-ibig.", duration: 12, animation: 'zoom' },
      { id: 2, image: "/src/assets/images/despair_squad_resolve_p8_1784344636916.jpg", text: "Tears of sorrow washed over the friends. 'My Lord, why have you forsaken us?' they cried.", textFilipino: "Ang mga luha ng dalamhati ay pumatak. 'Panginoon ko, bakit mo kami pinabayaan?' sigaw nila.", duration: 12, animation: 'shake' }
    ]
  },
  {
    id: 6,
    title: "Grace and Amendment",
    subtitle: "PART 6: REPENTANCE & FORGIVENESS",
    description: "Confronted by the holy light of Yahusha's sacrifice, Ninjin weeps in bitter repentance. Breaking down in tears, he seeks forgiveness. Usagyuuun embraces him, demonstrating Christlike grace.",
    descriptionFilipino: "Nang harapin ng banal na liwanag ng sakripisyo ni Yahusha, umiyak si Ninjin sa tapat na pagsisisi. Niyakap siya ni Usagyuuun, nagpapakita ng banal na kapatawaran.",
    status: 'Released',
    scenes: [
      { id: 1, image: "/src/assets/images/ninjin_pure_face_1784343893471.jpg", text: "Filled with profound remorse, Ninjin wept. 'Forgive me, I have sinned against Heaven!'", textFilipino: "Puno ng pagsisisi, umiyak si Ninjin. 'Patawarin ninyo ako, nagkasala ako sa Kalangitan!'", duration: 12, animation: 'dolly-in' },
      { id: 2, image: "/src/assets/images/usagyuuun_pure_face_1784343854659.jpg", text: "Usagyuuun held him tightly. 'By the blood of Yahusha, you are completely forgiven.'", textFilipino: "Niyakap siya nang mahigpit ni Usagyuuun. 'Sa pamamagitan ng dugo ni Yahusha, pinatawad ka na.'", duration: 12, animation: 'zoom' },
      { id: 3, image: "/src/assets/images/nekogyuuun_piano_p4_1784344522033.jpg", text: "With tears of amendment, they played a majestic song of worship, breaking demonic chains.", textFilipino: "Sa mga luha ng pagbabago, tumugtog sila ng awit ng pagsamba, sinisira ang mga tanikala ng kaaway.", duration: 12, animation: 'live-2d' }
    ]
  },
  {
    id: 7,
    title: "Storming the Abyss",
    subtitle: "PART 7: THE RECOVERY (CLIMAX 1)",
    description: "Armed with absolute faith and divine armor, the friends unitedly march straight into the belly of the beast. An epic, explosive battle begins to rescue Hana from the gates of death.",
    descriptionFilipino: "Armado ng lubos na pananampalataya, nagmartsa ang magkakaibigan patungo sa kalaliman. Isang epikong labanan ang nagsimula upang iligtas si Hana.",
    status: 'Released',
    scenes: [
      { id: 1, image: "/src/assets/images/friends_cosmic_discovery_new_1784343302495.jpg", text: "Filled with the Holy Spirit, they marched into the dark palace of the enemy.", textFilipino: "Puno ng Banal na Espiritu, nagmartsa sila patungo sa madilim na palasyo ng kaaway.", duration: 12, animation: 'pan-left' },
      { id: 2, image: "/src/assets/images/dimensional_rift_p5_1784344532137.jpg", text: "Angel armies of Lord Jesus fought alongside them, shattering the demonic legions.", textFilipino: "Ang mga hukbo ng anghel ng Panginoong Jesus ay nakipaglaban kasama nila, dinudurog ang mga demonyo.", duration: 12, animation: 'parallax' },
      { id: 3, image: "/src/assets/images/ninjin_cosmic_power_1784343557217.jpg", text: "Ninjin, redeemed and purified, unleashed holy flame to defend his family.", textFilipino: "Si Ninjin, na tinubos at nilinis, ay nagpakawalan ng banal na apoy upang ipagtanggol ang pamilya.", duration: 12, animation: 'impact' }
    ]
  },
  {
    id: 8,
    title: "It is Finished",
    subtitle: "PART 8: THE SUPREME TRIUMPH (CLIMAX 2)",
    description: "The dark lord attempts to engulf the universe. Standing at the precipice, Usagyuuun cries out the holy name of Yahuah Yahusha. Blinding, glorious light shatters the void forever.",
    descriptionFilipino: "Nagtangka ang pinuno ng dilim na lamunin ang uniberso. Sumigaw si Usagyuuun sa banal na pangalan ni Yahuah Yahusha, at ang banal na liwanag ay sumabog.",
    status: 'Released',
    scenes: [
      { id: 1, image: "/src/assets/images/golden_carrot_center_p6_1784344541614.jpg", text: "The Light of the World emerged from the clouds—glorious and supreme.", textFilipino: "Ang Liwanag ng Sanlibutan ay lumitaw mula sa mga ulap—luwalhati at kataas-taasan.", duration: 12, animation: 'zoom' },
      { id: 2, image: "/src/assets/images/final_battle_unity_p9_1784344552086.jpg", text: "With a thunderous shout of 'IT IS FINISHED!', the kingdom of darkness fell to pieces.", textFilipino: "Sa isang kulog na sigaw ng 'TAPOS NA!', ang kaharian ng kadiliman ay nagkapira-piraso.", duration: 12, animation: 'impact' }
    ]
  },
  {
    id: 9,
    title: "Eternal Happy Ending",
    subtitle: "PART 9: HEAVENLY CORONATION",
    description: "The most unique, unheard-of happy ending. The pearlescent gates open. Our Lord Jesus Christ sweeps Hana and Usagyuuun into an eternal embrace, wiping away every single tear forever.",
    descriptionFilipino: "Ang pinaka-natatangi at walang katulad na masayang pagtatapos. Bumukas ang mga perlas na pintuan. Niyakap sila ng Panginoong Jesus, pinapahid ang bawat luha.",
    status: 'Released',
    scenes: [
      { id: 1, image: "/src/assets/images/epic_saga_finale_shot_1784343918177.jpg", text: "The Heavens opened in absolute glory. There was no more pain, crying, or death.", textFilipino: "Nagbukas ang Kalangitan sa ganap na kaluwalhatian. Wala nang sakit, pag-iyak, o kamatayan.", duration: 15, animation: 'parallax' },
      { id: 2, image: "/src/assets/images/usagyuuun_pure_face_1784343854659.jpg", text: "And they heard the voice of the Father, Yahuah, saying: 'WELL DONE, MY FAITHFUL SERVANTS!'", textFilipino: "At narinig nila ang tinig ng Ama, si Yahuah, na nagsasabi: 'MABUTING GAWA, AKING MGA TAPAT NA LINGKOD!'", duration: 15, animation: 'zoom' },
      { id: 3, image: "/src/assets/images/final_battle_unity_p9_1784344552086.jpg", text: "GLORY TO THE FATHER, THE SON, AND THE HOLY SPIRIT. AMEN. FOREVER AND EVER.", textFilipino: "LUWALHATI SA AMA, SA ANAK, AT SA BANAL NA ESPIRITU. AMEN. MAGPASAWALANG HANGGAN.", duration: 20, animation: 'impact' }
    ]
  },
  {
    id: 10,
    title: "The Divine Journey",
    subtitle: "PART 10: FULL MOVIE",
    description: "The complete journey of faith, from Genesis to the Glorious Kingdom. An epic 2-hour 34-minute cinematic experience of His profound love.",
    descriptionFilipino: "Ang kumpletong paglalakbay ng pananampalataya, mula sa Simula hanggang sa Maluwalhating Kaharian. Isang epic na 2-oras at 34-minutong cinematic experience ng Kanyang malalim na pag-ibig.",
    status: 'Released',
    scenes: [] // Scenes will be handled by the full movie logic in App.tsx
  }
];
