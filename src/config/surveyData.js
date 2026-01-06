export const surveySections = [
  // SECTION 1: The Hook (Logo + Intro)
  {
    id: "intro-hero",
    title: "",
    questions: [
      {
        id: "start_hero",
        type: "hero_start",
        image: "/assets/fateflix-planet.png",
        subtitle: "CINEMATIC TASTE SURVEY",
        missionText: "We're building a movie matcher that gets your vibe, not just your watch history.",
        valueProps: [
          "A personalised astro-cinematic reading",
          "Beta tester access",
          "Eternal bragging rights as an early FateFlix insider"
        ],
        assuranceText: "Your guilty pleasures are safe here, so are your wild opinions.",
        buttonText: "Let's Begin"
      }
    ]
  },

  // SECTION 2: The Data (Cosmic Origins)
  {
    id: "astro-data",
    title: "Your Cosmic Identity",
    subtitle: "To cast your chart, we need your exact origins.",
    questions: [
      { id: "username", text: "What name should we call you in the credits?", type: "text", placeholder: "Name or Alias" },
      { id: "date", text: "Birth Date", type: "date" },
      { id: "time", text: "Birth Time", helpText: "Crucial for your Rising Sign.", type: "time", infoPopup: "Don't know your time? Call your mom, Check your birth certificate, Consult the galaxy you came from" },
      {
        id: "time_accuracy",
        text: "The Accuracy of your time of birth?",
        helpText: "The more precise you are, the deeper your astro-movie decoding.",
        type: "radio",
        options: [
          { value: "exact", label: "Exact time (you legend) ⭐" },
          { value: "approx_early", label: "Approximate: In the early hours of the morning" },
          { value: "approx_morning", label: "Approximate: Morning" },
          { value: "approx_midday", label: "Approximate: Midday" },
          { value: "approx_afternoon", label: "Approximate: Afternoon" },
          { value: "approx_night", label: "Approximate: Night" },
          { value: "unknown", label: "🤷 I have no idea (still works, but a bit more vague)" }
        ]
      },
      { id: "city", text: "Birth City", type: "text", placeholder: "e.g. Düsseldorf", disclaimer: "*P.S. We’ll use your birth data to align the stars. Your data is sacred (like a vintage VHS: not for rent, sale, or stream)." },
      // Keeping manual Lat/Long for now as requested for the Dev Endpoint
      { id: "latitude", text: "Latitude", type: "number", placeholder: "e.g. 51.22" },
      { id: "longitude", text: "Longitude", type: "number", placeholder: "e.g. 6.77" }
    ]
  },

  // SECTION II
  {
    id: "section-ii",
    title: "Attraction & Self-Casting",
    subtitle: "Who you are. Who you want. Who you play in the movie of life.",
    questions: [
      {
        id: "gender",
        text: "Your Gender",
        type: "radio",
        options: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "non_binary", label: "Non-binary" },
          { value: "trans", label: "Trans / Gender-expansive" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "attraction_style",
        text: "What's your attraction style or sexuality vibe?",
        helpText: "Helps us match your movie kisses, crushes, and chaotic soul connections.",
        type: "radio",
        options: [
          { value: "queer", label: "🌈 Queer and thriving" },
          { value: "men", label: "💋 Attracted to men" },
          { value: "women", label: "💅 Attracted to women" },
          { value: "spectrum", label: "💞 I love across the spectrum" },
          { value: "bi_pan", label: "🌪 Bi/Pan/Switch energy" },
          { value: "demi_sapio", label: "👁️ Demisexual / Sapiosexual" },
          { value: "asexual", label: "🧊 Asexual / No thanks, I'm here for plot" },
          { value: "figuring_out", label: "🤷‍♀️ Still figuring it out" },
          { value: "steamy_any", label: "🔥 I love anything steamy, no matter the form" },
          { value: "no_label", label: "🌀 I don't label it" },
          { value: "none", label: "🧬 None of the above — I’ll define it" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "cine_level",
        text: "Where would you place yourself on the Movie Love-o-Meter?",
        type: "radio",
        options: [
          { value: "cinephile", label: "Cinephile Supreme (Raised at Blockbuster, evolved on MUBI)" },
          { value: "lover", label: "Movie Lover (I've got favourites, I notice good dialogue and cool visuals)" },
          { value: "time_poor", label: "Time-Poor Watcher (I watch when I can, sometimes fall asleep)" },
          { value: "streaming_vortex", label: "Streaming Vortex (I consume it all, good, bad, trashy)" },
          { value: "popcorn", label: "Popcorn-Only Viewer (I go to the cinema for explosions and hot cast)" },
          { value: "sleepy", label: "Sleepy Streamer (Background noise to fall asleep)" },
          { value: "recovering", label: "Recovering Binger (I finish even the worst series. HELP!))" },
          { value: "scroller", label: "Lost in the Scroll (45 mins scrolling, watch nothing, scroll socials)" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "life_role",
        text: "In the movie of your life... what role do you play?",
        helpText: "The role you actually play over and over again.",
        type: "radio",
        options: [
          { value: "rescuer", label: "The Rescuer (Help, save, protect, fix)" },
          { value: "disruptor", label: "The Chaotic Disruptor (I stir the plot)" },
          { value: "outsider", label: "The Dreamy Outsider (Out of step, deeply in tune)" },
          { value: "overachiever", label: "The Overachiever (I carry the expectations and I deliver)" },
          { value: "observer", label: "The Mysterious Observer" },
          { value: "ride_or_die", label: "The Ride-or-Die (Loyal, fierce)" },
          { value: "comic", label: "The Comic Relief (I lighten the mood when it gets too heavy)" },
          { value: "wanderer", label: "The Wanderer (Never rooted)" },
          { value: "mirror", label: "The Mirror (I become who people need me to be)" },
          { value: "audience", label: "Just here for the popcorn (Audience vibes)" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "escapism_style",
        text: "Your Emotional Escapism Style?",
        helpText: "How do you use movies to deal (or not deal) with your emotions?",
        type: "checkbox",
        options: [
          { value: "heartbreak", label: "💔 Heartbreak Healer (for breakups, grief, or emotional longing survival)" },
          { value: "hangover", label: "😵 Hangover Hero (gentle recovery when I’m fragile)" },
          { value: "floodgate", label: "😭 Emotional Floodgate (I want to cry/release)" },
          { value: "analyzer", label: "🧐 Chaos Analyzer (Process life through movies)" },
          { value: "cozy", label: "🧸 Cozy Comedown (safety, warmth, emotional blankets)" },
          { value: "creative", label: "🎨 Creative Kickstart (Spark ideas/ambition)" },
          { value: "romance", label: "💘 Romance Igniter (Butterflies, chemistry, connection)" },
          { value: "distraction", label: "🙈 Emotional Distraction (Laugh, forget, disassociate)" },
          { value: "meaning", label: "🌌 Meaning Maker (Movies help me frame my life story)" },
          { value: "romanticizer", label: "🍷 Life Romanticizer (Make pain cinematic)" },
          { value: "beauty", label: "✨ Beauty Seeker (Vibes & aesthetics over story)" },
          { value: "control", label: "🎮 Control Watcher (when life is chaos, at least I choose the movie)" },
          { value: "decoder", label: "🔍 People Decoder (I study characters to understand psychology + relationships)" },
          { value: "offline", label: "🔌 Emotionally Offline (Don't feel them emotionally)" },
          { value: "ambience", label: "🛋️ Ambience-Only Watcher (Background energy not a full experience)" },
          { value: "other", label: "✨ Other" }
        ]
      },
      {
        id: "first_crush",
        text: "Who was your first cinematic obsession or role model?",
        helpText: "That one character, actor, or moment that rewired your brain. This isn’t about attraction, it’s about imprinting. The scene that made you want to be someone else or finally feel more like yourself.",
        type: "textarea",
        placeholder: "e.g. Wednesday Addams, Heath Ledger in 10 Things...",
        inspoPopup: "Julia Roberts in Erin Brockovich (courtroom scene), Tarantino (any film), Wednesday Addams/ Matilda, Trinity in The Matrix, Heath Ledger in 10 Things I Hate About You singing on the benches, Aragorn (LOTR), Sharon Stone in Basic Instinct (that one scene. Enough said.)"
      }
    ]
  },

  // SECTION III
  {
    id: "section-iii",
    title: "Cinematic Taste",
    subtitle: "What you watch, how you watch, and how it makes you feel.",
    questions: [
      {
        id: "watch_habit",
        text: "How do you watch most of the time?",
        type: "checkbox",
        options: [
          { value: "solo", label: "Alone, in full control" },
          { value: "partner", label: "With a partner (we negotiate)" },
          { value: "friends", label: "With friends (it's an experience)" },
          { value: "late_night", label: "Late at night (emotionally open)" },
          { value: "weekends", label: "Only on weekends (ritual)" },
          { value: "multitask", label: "While multitasking (background mode)" },
          { value: "transit", label: "On phone/tablet in transit" },
          { value: "bed", label: "In bed, to fall asleep" },
          { value: "binge", label: "I binge no matter who's around" },
          { value: "scroll", label: "I scroll forever, watch nothing" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "fav_era",
        text: "What's your favourite movie era?",
        type: "checkbox",
        options: [
          { value: "silent", label: "Silent Era - Visual storytelling before sound", examples: "(Metropolis, Nosferatu, Charlie Chaplin, Joan of Arc)" },
          { value: "1930s", label: "1930s - Hollywood fantasy during hard times", examples: "(Dracula, Frankenstein, King Kong, Snow White)" },
          { value: "1940s", label: "1940s - Shadows, Smoke & Suspense", examples: "(Casablanca, Double Indemnity, The Third Man)" },
          { value: "1950s", label: "1950s - Studio Magic & Technicolor", examples: "(Rear Window, Roman Holiday, Rebel Without A Cause)" },
          { value: "1960s", label: "1960s - Revolution, Nouvelle Vague & Cool Chaos", examples: "(The Graduate, La Dolce Vita, 8 1/2, Rosemary’s Baby)" },
          { value: "1970s", label: "1970s - Grit, Glam & Auteur Uprising", examples: "(The Godfather, Taxi Driver, A Woman Under the Influence, Alien)" },
          { value: "1980s", label: "1980s - Neon, Synths & Shoulder Pads", examples: "(The Breakfast Club, Labyrinth, Flashdance, Blade Runner)" },
          { value: "1990s", label: "1990s - Indie Boom & VHS Royalty", examples: "(Clueless, Titanic, Pulp Fiction, Before Sunrise, The Matrix)" },
          { value: "2000s", label: "2000s - Tumblr-core & Teen Dreams", examples: "(Eternal Sunshine, Donnie Darko, Marie Antoinette, Mean Girls)" },
          { value: "post2010", label: "Post-2010 - A24 & Softcore Apocalypse", examples: "(Her, Parasite, Aftersun, The Worst Person in The World, EEAAO)" },
          { value: "streaming", label: "Streaming Era - Prestige TV & Cultural Moments", examples: "(Stranger Things, Squid Game, Euphoria, Succession)" },
          { value: "fluid", label: "Era-fluid: Time is fake." }
        ]
      },
      {
        id: "culture_background",
        text: "Where did you grow up (or feel culturally shaped by)?",
        type: "checkbox",
        options: [
          // THE AMERICAS
          { value: "header_na", label: "The Americas 🌎", isHeader: true },
          { value: "usa", label: "United States" },
          { value: "canada", label: "Canada" },
          { value: "other_na", label: "Add country / region", isInlineOther: true },
          { value: "latin_america_sp", label: "Spanish-speaking Latin America" },
          { value: "brazil", label: "Brazil" },
          { value: "caribbean", label: "Caribbean / Afro-Caribbean" },
          { value: "other_latam", label: "Add country / region", isInlineOther: true },

          // EUROPE & UK
          { value: "header_eu", label: "Europe & UK 🇪🇺", isHeader: true },
          { value: "uk_ireland", label: "United Kingdom / Ireland" },
          { value: "germany_dach", label: "Germany / Austria / Switzerland" },
          { value: "france", label: "France" },
          { value: "italy", label: "Italy" },
          { value: "spain", label: "Spain" },
          { value: "eastern_europe", label: "Eastern Europe / Balkans" },
          { value: "nordics", label: "The Nordics ❄️" },
          { value: "other_eu", label: "Add country / region", isInlineOther: true },

          // MIDDLE EAST & WEST ASIA
          { value: "header_me", label: "Middle East & West Asia 🕌", isHeader: true },
          { value: "middle_east", label: "Middle East / Arabic / Persian" },
          { value: "other_me", label: "Add country / region", isInlineOther: true },

          // AFRICA & DIASPORA
          { value: "header_africa", label: "Africa & Diaspora 🥁", isHeader: true },
          { value: "africa_west", label: "West African" },
          { value: "africa_east_south", label: "East or Southern African" },
          { value: "other_africa", label: "Add country / region", isInlineOther: true },

          // ASIA & PACIFIC
          { value: "header_asia", label: "Asia & Pacific 🥢", isHeader: true },
          { value: "asia_east", label: "Japan / Korea / China / Taiwan" },
          { value: "asia_se", label: "SE Asia (Thailand, Vietnam, etc)" },
          { value: "asia_south", label: "South Asia (India, Pakistan, etc)" },
          { value: "other_asia", label: "Add country / region", isInlineOther: true },

          // INTERWOVEN IDENTITY
          { value: "header_id", label: "Interwoven Identity & Heritage ✨", isHeader: true },
          { value: "mixed", label: "Mixed heritage / Third culture kid" },
          { value: "queer", label: "Queer culture / chosen family" },
          { value: "other", label: "Other" },
        ]
      },
      {
        id: "environment_growing_up",
        text: "What kind of environment did you grow up in?",
        type: "checkbox",
        options: [
          { value: "eclectic", label: "Globally curious / culturally eclectic" },
          { value: "traditional", label: "Traditional / locally rooted" },
          { value: "internet", label: "Internet-raised (Tumblr, YouTube)" },
          { value: "religious", label: "Religious or values-based" },
          { value: "artistic", label: "Artistic / progressive / liberal" },
          { value: "disruptor", label: "I was the cultural disruptor" },
          { value: "quiet", label: "Quiet, minimal, or emotionally closed" },
          { value: "moving", label: "Always moving / never settled" },
          { value: "other", label: "Other" }
        ]
      }
    ]
  },

  // SECTION IV
  {
    id: "section-iv",
    title: "Cinematic Core Memories",
    subtitle: "The moments that made you.",
    questions: [
      {
        id: "first_feeling",
        text: "What's the first movie that ever made you feel something?",
        helpText: "Cry, scream, gasp, any emotion counts. Do you remember why?",
        type: "textarea",
        placeholder: "e.g. Bambi (shock + grief), E.T. (ugly cry)...",
        inspoPopup: "Bambi - that scene…, Matilda - discovering her powers, Cinema Paradiso - the kiss reel, E.T. - Elliot says goodbye (ouch, ugly cry), Romeo + Juliet (1996) - fish tank scene, Call Me By Your Name - final fireplace shot, Billy Elliot - dancing it out"
      },
      {
        id: "life_changing",
        text: "What movie changed your life or meant everything at some point?",
        helpText: "We're tracking your fate film. Turning point? Breakup comfort?",
        type: "textarea",
        placeholder: "Tell us what hit you and why...",
        inspoPopup: "It could’ve been a turning point, a comfort during a breakup, or a story that mirrored your own. A plot twist that mirrored your own? We don’t care if it’s a cult classic, or Oscar-winner… tell us what hit you and why.\n\n• After watching The Men Who Stare at Goats, I felt powerful in the job I hated. It gave me a weirdly magical way to survive corporate life. I started using Jedi mind tricks at meetings.\n• The Darjeeling Limited: booking a solo trip, spiritual reset\n• When I saw The Other Woman, I actually gave my relationship another shot. It reminded me that real life is messy and sometimes the grass isn't greener.\n• Billy Elliot: realizing I didn't have to follow someone else’s path.\n• Everything Everywhere Al At Once, I finally forgave my mom. And myself."
      },
      {
        id: "comfort_watch",
        text: "Your Ultimate Comfort Watch?",
        helpText: "(Movie or TV show)",
        type: "text",
        inspoPopup: "Think: Rainy Sundays, heartbreak nights, post-party comedown, or nostalgic resets.\n(Here are a few examples, but your vibe might be totally different: Gilmore Girls, Good Will Hunting, Shrek, Friends, The Office, The Holiday, Pretty Woman, Iron Man)"
      },
      {
        id: "power_watch",
        text: "What movie do you rewatch when you want to feel powerful?",
        type: "text",
        inspoPopup: "Here are a few examples, but your vibe might be totally different: Kill Bill, Black Swan, Erin Brockovich, Rocky, The Devil Wears Prada, Creed, Mad Max: Fury Road, Black Panther, The Favourite, The Matrix, Jennifer's Body, Everything Everywhere All at Once)"
      },
      {
        id: "date_impress",
        text: "What movie do you drop to impress a date / crush / dinner guest?",
        type: "text"
      }
    ]
  },

  // SECTION V
  {
    id: "section-v",
    title: "Cosmic Worldbuilding & Desire",
    subtitle: "Vibe, villains, universes & cravings.",
    questions: [
      {
        id: "movie_universe",
        text: "If you could live inside any movie universe... which one(s) would you pick?",
        type: "checkbox",
        options: [
          { value: "magical", label: "Magical worlds (Harry Potter, LOTR)" },
          { value: "scifi", label: "Sci-Fi realms (Blade Runner, Star Wars)" },
          { value: "aesthetic", label: "Aesthetic dreamlands (Barbie, Wes Anderson)" },
          { value: "romantic", label: "Romantic escapes (Call Me by Your Name)" },
          { value: "dystopia", label: "Futuristic dystopias (Her, Gattaca)" },
          { value: "surreal", label: "Trippy surrealism (Spirited Away, Inception)" },
          { value: "melancholia", label: "Cool melancholia (Lost in Translation)" },
          { value: "nature", label: "Nature & nostalgia (Totoro, Little Women)" },
          { value: "glamour", label: "Theatre and glamour (Moulin Rouge, Cabaret)" },
          { value: "thrilling", label: "Dangerously thrilling (John Wick, Kill Bill)" },
          { value: "old_world", label: "Old world elegance (The Age of Innocence, A Room with a View)" },
          { value: "gothic", label: "Gothic and strange (Pan's Labyrinth)" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "villain_relate",
        text: "Which villain do you secretly relate to? And... why?",
        helpText: "Who's your inner anti-hero?",
        type: "textarea",
        placeholder: "e.g. Amy Dunne, Patrick Bateman, Scar...",
        inspoPopup: "Misunderstood icons or just honest about their darkness?\n\n• Miranda Priestly (The Devil Wears Prada) - I've worked my ass oﬀ to get where I am.\n• Patrick Bateman (American Psycho) - Skincare, perfection, & clean aesthetics.\n• Tom Ripley (The Talented Mr. Ripley) - Outsider energy, wanting in.\n• Catherine Tramell (Basic Instinct) - Brilliant, unreadable, fully in control.\n• Scar (The Lion King) - Overlooked sibling plotting a comeback.\n• Hannibal Lecter (Silence of the Lambs) - Disturbing genius with impeccable manners."
      },
      {
        id: "forever_crush",
        text: "Who's your forever on-screen crush?",
        helpText: "From first movie crush to current obsession.",
        type: "textarea",
        inspoPopup: "Who's lived rent-free in your cinematic heart?\nCartoons count. Accidental awakenings count. One name or a chaotic timeline, both valid.\nGive us the timeline of your taste evolution.\n\n(Here are a few examples, but your vibe might be totally different: Salma Hayek in Desperado, Ewan McGregor in Moulin Rouge, River Phoenix in My Own Private Idaho, Michelle Pfeiffer in Batman Returns, Al Pacino in Dog Day Afternoon, Lola Bunny in Space Jam, Jude Law in The Talented Mr. Ripley, Tilda Swinton in Orlando, Sharon Stone in Basic Instinct, Angela Bassett in Strange Days, Monica Bellucci in anything)"
      },
      {
        id: "crave_most",
        text: "What do you crave most in a movie?",
        type: "checkbox",
        options: [
          { value: "emotional", label: "🥀 Soft, sad & deeply felt" },
          { value: "tension", label: "⚡ High stakes & tension (suspense, danger, edge-of-seat energy)" },
          { value: "chaos", label: "🌪️ Emotional chaos & catharsis (rage, release, revenge acts)" },
          { value: "clever", label: "🧩 Clever & conceptual (symbolism, sharp dialogue, plot twists)" },
          { value: "structure", label: "📐 Satisfying structure (I care about the plot)" },
          { value: "poetic", label: "🌌 Philosophical & poetic (existential & reflective)" },
          { value: "political_social", label: "✊ Politically conscious, socially relevant" },
          { value: "depth", label: "🧿 Characters with depth (inner worlds & transformation)" },
          { value: "performance", label: "🎭 Haunting performances" },
          { value: "chemistry", label: "🍷 Sexy, slow chemistry (glances > gestures > tension)" },
          { value: "stylish", label: "✨ Cool & stylish (mood, music, fashion)" },
          { value: "escapism", label: "🧸 Wholesome escapism (comfort, nostalgia & happy endings)" },
          { value: "immersive", label: "🏰 Immersive Worlds (I want to live inside)" },
          { value: "fun", label: "🍿 Fun, clever & quotable (rewatch energy)" },
          { value: "trippy", label: "🍄 Weird & trippy (surrealism is truth)" },
          { value: "dark", label: "🌑 Dark & seductive (noir, danger, desire)" },
          { value: "crime", label: "💰 Crime, hustle & heist" },
          { value: "adrenaline", label: "💥 Pure adrenaline (chase scenes, explosions, velocity)" },
          { value: "not_basic", label: "💎 Whatever makes my life feel less basic for 90 minutes" },
          { value: "other", label: "✨ Other" }
        ]
      }
    ]
  },

  // SECTION VILe
  {
    id: "section-vi",
    title: "Screen Education: What Trained Your Taste",
    subtitle: "You're nearly at the final reel.",
    questions: [
      {
        id: "tv_taste",
        text: "TV Taste Check: Pick the flavours that feed your soul.",
        type: "checkbox",
        options: [
          { value: "prestige", label: "Slow-burn prestige (long arcs, power, HBO-core)" },
          { value: "dark_drama", label: "Dark Drama (crime, revenge, moral mess)" },
          { value: "reality", label: "Reality chaos (Love Island, Housewives, Kardashians)" },
          { value: "comedy", label: "Comfort comedy (sitcoms, rewatch therapy)" },
          { value: "talk_shows", label: "Talk shows & panel shows (late night, interviews, comedians)" },
          { value: "animated", label: "Animated brilliance (BoJack, anime, adult animation)" },
          { value: "limited", label: "Limited series / anthologies (intense contained stories)" },
          { value: "retro", label: "Retro magic (Twin Peaks, Golden Girls, 90s teen shows)" },
          { value: "scifi_fantasy", label: "Sci-fi & fantasy worlds (myth & alternate realties)" },
          { value: "documentaries", label: "Documentaries & real stories (true crime, pop culture, sport)" },
          { value: "factual", label: "Factual entertainment & curiosity TV (Discovery, Nat Geo, science, nature)" },
          { value: "cooking", label: "Cooking & food shows" },
          { value: "sports", label: "Sports Competitions (matches, leagues, tournaments)" },
          { value: "talent", label: "Talent & performance shows (singing, dancing)" },
          { value: "lifestyle", label: "Lifestyle & background TV" },
          { value: "movie_only", label: "I’m movie-only. TV isn’t really my thing" },
          { value: "avoid_series", label: "I avoid series, I get addicted 😅" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "fav_tv",
        text: "What's your all-time favourite TV show?",
        type: "text"
      },
      {
        id: "cinematography",
        text: "How important is cinematography?",
        type: "radio",
        options: [
          { value: "obsessed", label: "Obsessed. I pause scenes to admire lighting." },
          { value: "nice", label: "Nice to have, but not a dealbreaker" },
          { value: "palette", label: "Only if it has a colour palette worth mood-boarding" },
          { value: "skip", label: "I skip to the dialogue" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "directors",
        text: "Do you care about directing styles?",
        type: "checkbox",
        helpText: "Pick up to 5.",
        options: [
          { value: "header_modern", label: "MODERN ICONS & CROWD PLEASERS", isHeader: true },
          { value: "gerwig", label: "Greta Gerwig", examples: "Lady Bird, Barbie, Little Women" },
          { value: "peele", label: "Jordan Peele", examples: "Get Out, Us, Nope" },
          { value: "spielberg", label: "Steven Spielberg", examples: "E.T., Jurassic Park, Schindler’s List, Jaws" },
          { value: "tarantino", label: "Quentin Tarantino", examples: "Pulp Fiction, Kill Bill, Inglorious Basterds" },
          { value: "pta", label: "Paul Thomas Anderson", examples: "One Battle After Another, Boogie Nights, There Will Be Blood" },
          { value: "daniels", label: "The Daniels (Daniel Kwan & Daniel Scheinert)", examples: "Everything Everywhere All At Once, Swiss Army Man" },
          { value: "nolan", label: "Christopher Nolan", examples: "Inception, Interstellar, Oppenheimer, The Dark Knight" },
          { value: "fennell", label: "Emerald Fennell", examples: "Wuthering Heights, Promising Young Woman, Saltburn" },
          { value: "lucas", label: "George Lucas", examples: "Star Wars, THX 1138, American Graffiti" },
          { value: "jackson", label: "Peter Jackson", examples: "The Lord of the Rings, Heavenly Creatures, King Kong" },
          { value: "howard", label: "Ron Howard", examples: "A Beautiful Mind, Rush, Frost/Nixon, Apollo 13" },
          { value: "cameron", label: "James Cameron", examples: "Titanic, Terminator, Avatar" },
          { value: "phillips", label: "Todd Phillips", examples: "The Hangover, Joker, War Dogs" },
          { value: "scott", label: "Ridley Scott", examples: "Alien, Gladiator, Thelma & Louise" },
          { value: "boyle", label: "Danny Boyle", examples: "Trainspotting, Slumdog Millionaire, 28 Days Later" },
          { value: "miyazaki", label: "Hayao Miyazaki", examples: "Spirited Away, My Neighbor Totoro, Princess Mononoke" },
          { value: "bong_joon_ho", label: "Bong Joon-ho", examples: "Parasite, Snowpiercer, Memories of Murder" },
          { value: "hughes", label: "John Hughes", examples: "The Breakfast Club, Ferris Bueller’s Day Off, Pretty in Pink" },

          { value: "header_grit", label: "GRIT, CRIME & INTENSITY", isHeader: true },
          { value: "spike_lee", label: "Spike Lee", examples: "Do the Right Thing, Malcolm X, BlacKkKlansman" },
          { value: "larry_clark", label: "Larry Clark", examples: "Kids, Bully, Ken Park" },
          { value: "adrian_lyne", label: "Adrian Lyne", examples: "Fatal Attraction, 9½ Weeks, Unfaithful" },
          { value: "scorsese", label: "Martin Scorsese", examples: "Goodfellas, Taxi Driver, The Wolf of Wall Street" },
          { value: "de_palma", label: "Brian De Palma", examples: "Carrie, Scarface, Blow Out" },
          { value: "safdie", label: "Safdie Brothers", examples: "Uncut Gems, Good Time" },
          { value: "coen_bros", label: "Coen Brothers", examples: "Fargo, No Country for Old Men, The Big Lebowski" },
          { value: "eastwood", label: "Clint Eastwood", examples: "Million Dollar Baby, Gran Torino, American Sniper" },
          { value: "fincher", label: "David Fincher", examples: "Fight Club, The Social Network, Gone Girl" },
          { value: "meirelles", label: "Fernando Meirelles", examples: "City of God, The Constant Gardener, Blindness" },
          { value: "mann", label: "Michael Mann", examples: "Heat, Collateral, The Insider" },
          { value: "mangold", label: "James Mangold", examples: "Walk the Line, Logan, Ford v Ferrari" },
          { value: "mcqueen", label: "Steve McQueen", examples: "Shame, 12 Years a Slave, Widows" },
          { value: "ritchie", label: "Guy Ritchie", examples: "Snatch, Lock, Stock and Two Smoking Barrels, The Gentlemen" },
          { value: "audiard", label: "Jacques Audiard", examples: "A Prophet, Rust and Bone, Dheepan" },

          { value: "header_dark", label: "DARK, SURREAL & MIND-BENDING", isHeader: true },
          { value: "lynch", label: "David Lynch", examples: "Mulholland Drive, Blue Velvet, Eraserhead" },
          { value: "kubrick", label: "Stanley Kubrick", examples: "2001: A Space Odyssey, The Shining, A Clockwork Orange" },
          { value: "jonze", label: "Spike Jonze", examples: "Her, Being John Malkovich, Adaptation" },
          { value: "inarritu", label: "Alejandro González Iñárritu", examples: "Birdman, Babel, Amores Perros, The Revenant" },
          { value: "glazer", label: "Jonathan Glazer", examples: "Under the Skin, Sexy Beast, The Zone of Interest" },
          { value: "ostlund", label: "Ruben Östlund", examples: "Triangle of Sadness, Force Majeure, The Square" },
          { value: "villeneuve", label: "Denis Villeneuve", examples: "Arrival, Blade Runner 2049, Dune, Prisoners" },
          { value: "argento", label: "Dario Argento", examples: "Suspiria, Deep Red, Inferno" },
          { value: "lanthimos", label: "Yorgos Lanthimos", examples: "Poor Things, Kinds Of Kindness, The Lobster" },
          { value: "noe", label: "Gaspar Noé", examples: "Enter the Void, Climax, LOVE, Irreversible" },
          { value: "von_trier", label: "Lars von Trier", examples: "Melancholia, Dancer in the Dark, Antichrist" },
          { value: "tarkovsky", label: "Andrei Tarkovsky", examples: "Stalker, Solaris, The Mirror" },
          { value: "haneke", label: "Michael Haneke", examples: "Amour, Funny Games, Caché" },
          { value: "seidl", label: "Ulrich Seidl", examples: "Paradise: Love, Rimini, Safari" },
          { value: "park_chan_wook", label: "Park Chan-wook", examples: "Oldboy, The Handmaiden, Decision to Leave" },
          { value: "oshima", label: "Nagisa Oshima", examples: "In the Realm of the Senses, Merry Christmas Mr. Lawrence, Death by Hanging" },
          { value: "weerasethakul", label: "Apichatpong Weerasethakul", examples: "Uncle Boonmee Who Can Recall His Past Lives, Memoria, Tropical Malady" },

          { value: "header_stylized", label: "STYLIZED VIBES & AESTHETICS", isHeader: true },
          { value: "coppola_s", label: "Sofia Coppola", examples: "Lost in Translation, Marie Antoinette, The Virgin Suicides" },
          { value: "wes_anderson", label: "Wes Anderson", examples: "The Royal Tenenbaums, Moonrise Kingdom, The Grand Budapest Hotel" },
          { value: "korine", label: "Harmony Korine", examples: "Beach Bum, Spring Breakers, Trash Humpers" },
          { value: "burton", label: "Tim Burton", examples: "Edward Scissorhands, Beetlejuice, Nightmare Before Christmas" },
          { value: "schnabel", label: "Julian Schnabel", examples: "The Diving Bell and the Butterfly, Basquiat, Before Night Falls" },
          { value: "sorrentino", label: "Paolo Sorrentino", examples: "The Great Beauty, Youth, The Hand of God" },
          { value: "cuaron", label: "Alfonso Cuarón", examples: "Roma, Gravity, Y Tu Mamá También" },
          { value: "waters", label: "John Waters", examples: "Pink Flamingos, Hairspray, Female Trouble" },
          { value: "marshall", label: "Rob Marshall", examples: "Chicago, Memoirs of a Geisha, Into the Woods" },
          { value: "roeg", label: "Nicolas Roeg", examples: "Don’t Look Now, The Man Who Fell to Earth, Walkabout" },
          { value: "song", label: "Céline Song", examples: "Materialists, Past Lives" },
          { value: "wells", label: "Charlotte Wells", examples: "Aftersun, Tuesday, Laps" },
          { value: "rohrwacher", label: "Alice Rohrwacher", examples: "La Chimera, Happy as Lazzaro, The Wonders" },
          { value: "potter", label: "Sally Potter", examples: "Orlando, The Tango Lesson, Ginger & Rosa" },
          { value: "julien", label: "Isaac Julien", examples: "Looking for Langston, Young Soul Rebels, Lessons of the Hour" },
          { value: "russell", label: "Ken Russell", examples: "Women in Love, The Devils, Tommy" },
          { value: "almodovar", label: "Pedro Almodóvar", examples: "All About My Mother, Talk to Her, Pain and Glory" },
          { value: "guadagnino", label: "Luca Guadagnino", examples: "Call Me By Your Name, Challengers, I Am Love, Bones and All" },
          { value: "denis", label: "Claire Denis", examples: "Beau Travail, High Life, Trouble Every Day" },
          { value: "beineix", label: "Jean-Jacques Beineix", examples: "Diva, Betty Blue, The Moon in the Gutter" },
          { value: "greenaway", label: "Peter Greenaway", examples: "The Cook, the Thief, His Wife & Her Lover, Prospero’s Books, A Zed & Two Noughts" },
          { value: "yimou", label: "Zhang Yimou", examples: "Raise the Red Lantern, Hero, House of Flying Daggers" },
          { value: "wong_kar_wai", label: "Wong Kar-wai", examples: "In the Mood for Love, Chungking Express, Happy Together" },

          { value: "header_humanist", label: "HUMANIST, INDIE & EMOTIONAL", isHeader: true },
          { value: "jenkins", label: "Barry Jenkins", examples: "Moonlight, If Beale Street Could Talk" },
          { value: "trier", label: "Joachim Trier", examples: "The Worst Person in the World, Sentimental Value, Oslo" },
          { value: "nichols", label: "Mike Nichols", examples: "The Graduate, Who’s Afraid of Virginia Woolf?, Working Girl" },
          { value: "van_sant", label: "Gus Van Sant", examples: "Good Will Hunting, My Own Private Idaho, Elephant" },
          { value: "cassavetes", label: "John Cassavetes", examples: "Woman Under the Influence, Faces, Opening Night" },
          { value: "allen", label: "Woody Allen", examples: "Annie Hall, Manhattan, Midnight in Paris" },
          { value: "baumbach", label: "Noah Baumbach", examples: "Marriage Story, Frances Ha, Jay Kelly, The Squid and the Whale" },
          { value: "salles", label: "Walter Salles", examples: "I'm still here, Central Station, The Motorcycle Diaries, On the Road" },
          { value: "zhao", label: "Chloé Zhao", examples: "Nomadland, The Rider, Eternals" },
          { value: "linklater", label: "Richard Linklater", examples: "Before Sunrise trilogy, Dazed and Confused, Boyhood" },
          { value: "baker", label: "Sean Baker", examples: "Anora, The Florida Project, Red Rocket, Tangerine" },
          { value: "duvernay", label: "Ava DuVernay", examples: "Selma, 13th, When They See Us" },
          { value: "triet", label: "Justine Triet", examples: "Sibyl, Anatomy of a Fall, Victoria" },
          { value: "meyers", label: "Nancy Meyers", examples: "The Holiday, Something’s Gotta Give, It’s Complicated, Nancy Meyers" },
          { value: "heckerling", label: "Amy Heckerling", examples: "Clueless, Fast Times at Ridgemont High, Look Who’s Talking" },
          { value: "daldry", label: "Stephen Daldry", examples: "The Hours, Billy Elliot, The Reader" },
          { value: "arnold", label: "Andrea Arnold", examples: "Fish Tank, American Honey, Wasp" },
          { value: "loach", label: "Ken Loach", examples: "I, Daniel Blake, The Wind That Shakes the Barley, Sorry We Missed You" },
          { value: "haigh", label: "Andrew Haigh", examples: "Weekend, 45 Years, All of Us Strangers" },
          { value: "leigh", label: "Mike Leigh", examples: "Secrets & Lies, Vera Drake, Another Year" },
          { value: "ramsay", label: "Lynne Ramsay", examples: "We Need to Talk About Kevin, You Were Never Really Here, Ratcatcher" },
          { value: "sciamma", label: "Céline Sciamma", examples: "Portrait of a Lady on Fire, Girlhood, Petite Maman" },
          { value: "varda", label: "Agnès Varda", examples: "Cléo from 5 to 7, Vagabond, The Gleaners and I" },
          { value: "wenders", label: "Wim Wenders", examples: "Paris, Texas, Wings of Desire, Buena Vista Social Club" },
          { value: "ade", label: "Maren Ade", examples: "Toni Erdmann, Everyone Else, The Forest for the Trees" },
          { value: "kechiche", label: "Abdellatif Kechiche", examples: "Blue Is the Warmest Colour, The Secret of the Grain, Games of Love and Chance" },
          { value: "ozpetek", label: "Ferzan Özpetek", examples: "Nuovo Olimpo, Naples in Veils, Diamonds" },

          { value: "header_legends", label: "THE LEGENDS & CLASSICS", isHeader: true },
          { value: "welles", label: "Orson Welles", examples: "Citizen Kane, Touch of Evil, The Magnificent Ambersons" },
          { value: "bergman", label: "Ingmar Bergman", examples: "The Seventh Seal, Persona, Scenes from a Marriage" },
          { value: "hitchcock", label: "Alfred Hitchcock", examples: "Psycho, Vertigo, Rear Window, North by Northwest" },
          { value: "leone", label: "Sergio Leone", examples: "The Good, the Bad and the Ugly, Once Upon a Time in the West" },
          { value: "ford", label: "John Ford", examples: "The Searchers, Stagecoach, The Grapes of Wrath" },
          { value: "hawks", label: "Howard Hawks", examples: "His Girl Friday, Rio Bravo, Bringing Up Baby" },
          { value: "lumet", label: "Sidney Lumet", examples: "12 Angry Men, Dog Day Afternoon, Network" },
          { value: "reed", label: "Carol Reed", examples: "The Third Man, Oliver!, Odd Man Out" },
          { value: "antonioni", label: "Michelangelo Antonioni", examples: "L’Avventura, Blow-Up, The Passenger" },
          { value: "coppola_ff", label: "Francis Ford Coppola", examples: "The Godfather trilogy, Apocalypse Now, The Conversation" },
          { value: "bertolucci", label: "Bernardo Bertolucci", examples: "The Conformist, Last Tango in Paris, The Dreamers" },
          { value: "lean", label: "David Lean", examples: "Lawrence of Arabia, Doctor Zhivago, The Bridge on the River Kwai" },
          { value: "fellini", label: "Federico Fellini", examples: "La Dolce Vita, 8½, Amarcord" },
          { value: "rossellini", label: "Roberto Rossellini", examples: "Rome, Open City, Journey to Italy" },
          { value: "truffaut", label: "François Truffaut", examples: "The 400 Blows, Jules and Jim, Day for Night" },
          { value: "malle", label: "Louis Malle", examples: "Au Revoir les Enfants, Elevator to the Gallows, Atlantic City" },
          { value: "pasolini", label: "Pier Paolo Pasolini", examples: "The Gospel According to St. Matthew, Salò, Teorema" },
          { value: "mizoguchi", label: "Kenji Mizoguchi", examples: "Ugetsu, Sansho the Bailiff, Street of Shame" },
          { value: "ozu", label: "Yasujiro Ozu", examples: "Tokyo Story, Late Spring, An Autumn Afternoon" },
          { value: "pollack", label: "Sydney Pollack", examples: "Out of Africa, Tootsie, The Way We Were" },

          { value: "header_special", label: "SPECIAL", isHeader: true },
          { value: "none", label: "I don't know any directors and I don't care…lol" },
          { value: "other", label: "Did we miss a favourite? Drop their names here." }
        ]
      },
      {
        id: "access_growing_up",
        text: "How did you mostly access movies growing up?",
        type: "checkbox",
        options: [
          { value: "blockbuster", label: "Blockbuster / VHS" },
          { value: "cinema", label: "Cinema / festivals" },
          { value: "tv", label: "TV & cable classics" },
          { value: "streaming", label: "Streaming-only (Netflix era)" },
          { value: "pirate", label: "Pirate passion (Studying via downloads)" },
          { value: "mentor", label: "Film school or family curation" },
          { value: "religious", label: "Religious / censored media only" },
          { value: "late", label: "I discovered film late" },
          { value: "rare", label: "Rare occasions only" },
          { value: "other", label: "Other" }
        ]
      }
    ]
  },

  // SECTION VII
  {
    id: "section-vii",
    title: "Genres & Turn-offs",
    subtitle: "Genres you love. Red flags you avoid.",
    questions: [
      {
        id: "genres_love",
        text: "Genres you never get sick of 🍿:",
        type: "checkbox",
        options: [
          { value: "romance", label: "Romance & Rom-Coms" },
          { value: "drama", label: "Drama/Emotional Stories" },
          { value: "comedy", label: "Comedy (light or dark)" },
          { value: "action", label: "Action/ Adventure" },
          { value: "thriller", label: "Thrillers & Suspense" },
          { value: "horror", label: "Horror (from elevated to slasher)" },
          { value: "scifi_fantasy", label: "Sci-Fi, Fantasy & Myth" },
          { value: "indie", label: "Indie, Arthouse & Cult" },
          { value: "musical", label: "Music, Dance & Performance" },
          { value: "sports", label: "Sports & Underdog Stories" },
          { value: "biopic", label: "Biopics & True Stories" },
          { value: "documentary", label: "Documentary & Real Life Stories" },
          { value: "queer", label: "Queer Cinema & LGBTQ+ Stories" },
          { value: "historical", label: "Historical & Period" },
          { value: "trash_reality", label: "Trash TV/ Reality Gold" },
          { value: "classics", label: "Classics & Black&White" },
          { value: "westerns", label: "Westerns & Frontier Epics" },
          { value: "genre_fluid", label: "I’m genre-fluid" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "turn_offs",
        text: "What do you NOT vibe with on screen? 🚩",
        type: "checkbox",
        options: [
          { value: "sad", label: "No sad endings, please. Life is hard enough." },
          { value: "romcom_cringe", label: "Rom-com sceptic. I'm a realist." },
          { value: "scary", label: "I don't do scary." },
          { value: "sexual", label: "Too steamy. Here for plot not pelvis." },
          { value: "gore", label: "Excessive gore or violence. I’m out." },
          { value: "snobbery", label: "Prestige snobbery. Award-bait that takes life too seriously." },
          { value: "no_romance", label: "No romance, at all. I need at least one make-out scene." },
          { value: "scifi_fantasy", label: "Sci-fi / fantasy. Not my universe." },
          { value: "weird_sex", label: "Erotic + weird. Not trying to relive a fever dream from a Berlin sex club." },
          { value: "clowns", label: "Clowns, absolutely not. Not even in an arthouse film." },
          { value: "reality_tv", label: "Love Island, Housewives, Kardashians, hard pass. I want film, not filler." },
          { value: "subtitles", label: "Subtitles. If it’s not in my language, I’m unlikely to watch it." },
          { value: "marvel", label: "I don't do Marvel. Not catching that cultural virus." },
          { value: "creepy_dolls", label: "Creepy kids or haunted toys. Demons, dolls, no thanks." },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "hated_film",
        text: "What's a film everyone else loved... but you hated? Tell us why.",
        type: "textarea",
        inspoPopup: "Think: the Oscar darling that bored you. The Netflix smash that felt soulless. The cult classic you found cringe.\nBelow are sample confessions to spark your vibe: feel free to riff, roast, or reveal:\n\n• Titanic — I rooted for the iceberg.\n• Everything Everywhere All at Once — “It felt like watching 15 TikToks at once during a panic attack. I respect the ambition but it lost me somewhere between hot dog fingers and multiverse taxes.”\n• Elvis (Baz Luhrmann) — “Felt like watching a Vegas slot machine explode for 2.5 hours. Austin Butler did great, but Baz directed like he had 12 Red Bulls and no editor.”\n• Avatar (all of them) — “It's just blue Pocahontas with fancier trees. Stunning visuals, sure, but 3D glasses couldn't save that plot from being aggressively ‘meh.'”\n• Emilia Pérez — I didn't know if I was watching an opera, a telenovela, or a Eurovision fever dream.\n• La La Land — BlaBla Land",
        placeholder: "e.g. Titanic, Everything Everywhere All at Once, Avatar..."
      },
      {
        id: "hype_style",
        text: "Hype Tracker or Timeless Watcher?",
        helpText: "How do you dance with hype, buzz, and cult classics?",
        type: "radio",
        options: [
          { value: "drops", label: "I watch everything the moment it drops." },
          { value: "resist", label: "I resist it until it really blows up" },
          { value: "crush", label: "Only if my crush is in it" },
          { value: "pretend", label: "I pretend not to care, but I watch everything" },
          { value: "wait", label: "I wait 5 years and watch it when no one cares" },
          { value: "cult", label: "Cult Classics over hype, always" },
          { value: "rare", label: "I like rare finds no one's heard of" },
          { value: "right_time", label: "The right movie finds me when I need it, not when it's trending" },
          { value: "both", label: "Honestly? Both. If it hits, it hits." }
        ]
      }
    ]
  },

  // SWIPE SECTION
  {
    id: "section-swipe",
    title: "Swipe Right on Your Movie Mirror",
    subtitle: "Who's the character you see yourself in?",
    questions: [
      {
        id: "character_match",
        text: "Who’s your movie mirror? The character that feels uncomfortably… you.",
        helpText: "Your vibe twin. Alter ego. The one people say you remind them of, or the one who’d absolutely play you in a film.\n(No thinking too hard. First instinct counts.)\nAdd up to 3 characters, icons, alter egos.\nBeing one thing is overrated.",
        type: "text",
        uiType: "multi_entry",
        maxEntries: 3,
        inspoPopup: "Examples for Inspo:\n\n• Fleabag (messy icon energy)\n• Amelie (whimsical dreamer)\n• Kim Kardashian (proof you can rebrand anything)\n• Robert De Niro - Taxi Driver (brooding outsider)\n• Dustin Hoffman - The Graduate (confused soft boy)\n• Mr.T (chaotic protector)\n• Jane Fonda (feminist fire)\n• Jules - Euphoria (ethereal)\n• David Bowie (genderless cosmic alien)\n• Tony Soprano (misunderstood leader)\n• Grace Jones (futuristic icon)\n• Wednesday Addams (deadpan legend)\n\nDon’t know the name? Describe the vibe, we’ll get it."
      }
    ]
  },

  // SECTION VIII
  {
    id: "section-viii",
    title: "Global Culture",
    subtitle: "Subtitles? Prestige?",
    questions: [
      {
        id: "foreign_films",
        text: "How do you feel about foreign films & shows?",
        type: "radio",
        options: [
          { value: "love", label: "Yes, I live for subtitles" },
          { value: "sometimes", label: "Sometimes" },
          { value: "not_really", label: "Not really" },
          { value: "lush", label: "They're visually lush/beautiful" },
          { value: "demanding", label: "Subtitles demand full attention (can't multitask)" },
          { value: "dubbed", label: "As long as it's dubbed, I'm fine" },
          { value: "other", label: "Other" }
        ]
      }
    ]
  },

  // SECTION IX
  {
    id: "section-ix",
    title: "FateFlix Fit & Feedback",
    subtitle: "Mood, recommendations, and future app features.",
    questions: [
      {
        id: "selection_method",
        text: "In a minefield of content... how do you actually choose your next movie or show?",
        type: "checkbox",
        options: [
          { value: "scroll", label: "I scroll until something clicks (Netflix/Prime/MUBI/AppleTV)" },
          { value: "notes", label: "Chaotic Notes app lists" },
          { value: "people", label: "I follow people, not lists (actors, directors, crushes)" },
          { value: "google", label: "Google it (search or ratings)" },
          { value: "reviews", label: "Ratings & reviews (Letterboxd, IMDb, Rotten Tomatoes, Reddit, Metacritic)" },
          { value: "top10", label: "I trust what’s trending (Top 10)" },
          { value: "friend", label: "I ask my film friend" },
          { value: "vibes", label: "I choose by mood or aesthetic" },
          { value: "comfort", label: "Comfort rewatch (decision successfully avoided)" },
          { value: "fatigue", label: "Decision fatigue is real. Just pick for me." },
          { value: "ai", label: "I ask AI" },
          { value: "unavailable", label: "It’s never on the platform I’m paying for." },
          { value: "trailer_spiral", label: "Trailer Spiral. Movie night becomes trailer night... again." },
          { value: "fateflix", label: "Just waiting for FateFlix to drop 😌" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "discovery_apps",
        text: "Which of these apps do you actually use for movie discovery?",
        type: "checkbox",
        options: [
          { value: "letterboxd", label: "Letterboxd" },
          { value: "imdb", label: "IMDb" },
          { value: "rotten_tomatoes", label: "Rotten Tomatoes" },
          { value: "taste_io", label: "Taste.io" },
          { value: "social", label: "Social media (TikTok, Instagram, YouTube)" },
          { value: "upflix", label: "Upflix" },
          { value: "moviepal", label: "Moviepal" },
          { value: "justwatch", label: "JustWatch" },
          { value: "tv_time", label: "TV Time" },
          { value: "reelgood", label: "Reelgood" },
          { value: "metacritic", label: "Metacritic" },
          { value: "none", label: "None" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "share_qr",
        type: "qr_share",
        text: "Would you share this quiz with your friends?",
        subtitle: "Screenshot the QR code for your camera roll. Perfect for date nights, dinner parties, or flexing your movie taste on the group chat."
      },
      {
        id: "discovery",
        text: "How did you find out about this survey?",
        type: "radio",
        options: [
          { value: "friend", label: "A friend sent it to me" },
          { value: "founder", label: "Invited by a FateFlix founder" },
          { value: "online", label: "Stumbled upon it online" },
          { value: "school", label: "Film school / class" },
          { value: "event", label: "Public event or street moment" },
          { value: "cosmic", label: "Cosmic Calling" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "email",
        text: "We need your email to send your astro-cinematic gift.",
        helpText: "No spam, just stardust.",
        type: "email",
        placeholder: "user@example.com"
      },
      {
        id: "beta_test",
        text: "Would you like to beta test the Fateflix app once it's live?",
        type: "radio",
        options: [
          { value: "yes", label: "Yes, I need this" },
          { value: "no", label: "No, I gatekeep" }
        ]
      },
      {
        id: "open_feedback",
        text: "Anything we should know?",
        helpText: "Got feedback on the survey, ideas for FateFlix, or something you wish existed in a movie app?\nThis is your moment. We read every response.",
        type: "textarea",
        placeholder: "Thoughts, feedback, feature ideas, wild wishes…"
      },
      {
        id: "top3_films",
        text: "TOP 3 FILMS",
        type: "textarea",
        placeholder: "1.\n2.\n3."
      },
      {
        id: "top3_series",
        text: "TOP 3 SERIES",
        type: "textarea",
        placeholder: "1.\n2.\n3."
      },
      {
        id: "top3_docs",
        text: "TOP 3 DOCS",
        type: "textarea",
        placeholder: "1.\n2.\n3."
      }
    ]
  }
];
