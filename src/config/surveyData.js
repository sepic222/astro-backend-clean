export const surveySections = [
  // SECTION 1: The Hook (Logo + Intro)
  {
    id: "intro-hero",
    title: "",
    questions: [
      {
        id: "start_hero",
        type: "hero_start",
        image: "/assets/survey-logo.svg", // Logo file in public/assets/
        title: "FATEFLIX",
        subtitle: "PRESENTS",
        text: "Before we decode your cinematic soul, we need to anchor you in space and time.",
        buttonText: "Enter the Vortex"
      }
    ]
  },

  // SECTION 2: The Data (Cosmic Origins)
  {
    id: "astro-data",
    title: "Your Coordinates",
    subtitle: "To cast your chart, we need your exact origins.",
    questions: [
      { id: "username", text: "What name should we call you in the credits?", type: "text", placeholder: "Name or Alias" },
      { id: "date", text: "Birth Date", type: "date" },
      { id: "time", text: "Birth Time", helpText: "Crucial for your Rising Sign.", type: "time" },
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
      { id: "city", text: "Birth City", type: "text", placeholder: "e.g. Düsseldorf" },
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
          { value: "queer", label: "Queer and thriving" },
          { value: "men", label: "Attracted to men" },
          { value: "women", label: "Attracted to women" },
          { value: "spectrum", label: "I love across the spectrum" },
          { value: "bi_pan", label: "Bi/Pan/Switch energy" },
          { value: "demi_sapio", label: "Demisexual / Sapiosexual" },
          { value: "asexual", label: "Asexual / No thanks, I'm here for plot" },
          { value: "figuring_out", label: "Still figuring it out" },
          { value: "steamy_any", label: "I love anything steamy, no matter the form" },
          { value: "no_label", label: "I don't label it" }
        ]
      },
      {
        id: "cine_level",
        text: "Where would you place yourself on the Movie Love-o-Meter?",
        type: "radio",
        options: [
          { value: "cinephile", label: "Cinephile Supreme (Raised at Blockbuster, evolved on MUBI)" },
          { value: "lover", label: "Movie Lover (I've got favourites, I notice details)" },
          { value: "time_poor", label: "Time-Poor Watcher (I watch when I can, sometimes fall asleep)" },
          { value: "streaming_vortex", label: "Streaming Vortex (I consume it all, good, bad, trashy)" },
          { value: "popcorn", label: "Popcorn-Only Viewer (Here for explosions and hot cast)" },
          { value: "sleepy", label: "Sleepy Streamer (Background noise to fall asleep)" },
          { value: "recovering", label: "Recovering Binger (I lie to keep watching)" },
          { value: "scroller", label: "Lost in the Scroll (45 mins scrolling, watch nothing)" }
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
          { value: "overachiever", label: "The Overachiever / Golden Child" },
          { value: "observer", label: "The Mysterious Observer" },
          { value: "ride_or_die", label: "The Ride-or-Die (Loyal, fierce)" },
          { value: "comic", label: "The Comic Relief" },
          { value: "wanderer", label: "The Wanderer (Never rooted)" },
          { value: "mirror", label: "The Mirror (I become who people need)" },
          { value: "audience", label: "Just here for the popcorn (Audience vibes)" }
        ]
      },
      {
        id: "escapism_style",
        text: "Your Emotional Escapism Style?",
        helpText: "How do you use movies to deal (or not deal) with your emotions?",
        type: "radio",
        options: [
          { value: "heartbreak", label: "Heartbreak Healer (Breakup, loss, longing)" },
          { value: "hangover", label: "Hangover Hero (Fragile, fuzzy, gentle recovery)" },
          { value: "floodgate", label: "Emotional Floodgate (I want to cry/release)" },
          { value: "analyzer", label: "Chaos Analyzer (Process life through stories)" },
          { value: "cozy", label: "Cozy Comedown (Safe, soothed, soft)" },
          { value: "creative", label: "Creative Kickstart (Spark ideas/ambition)" },
          { value: "romance", label: "Romance Igniter (Butterflies, chemistry)" },
          { value: "distraction", label: "Emotional Distraction (Laugh, forget, disassociate)" },
          { value: "romanticizer", label: "Life Romanticizer (Make pain cinematic)" },
          { value: "beauty", label: "Beauty Seeker (Vibes & aesthetics over story)" },
          { value: "control", label: "Control Watcher (Choose what I feel)" },
          { value: "decoder", label: "People Decoder (Understand psychology)" },
          { value: "offline", label: "Emotionally Offline (Don't feel them emotionally)" },
          { value: "ambience", label: "Ambience-Only Watcher (Background energy)" }
        ]
      },
      {
        id: "first_crush",
        text: "Who was your first cinematic obsession or role model?",
        helpText: "That one character, actor, or moment that rewired your brain.",
        type: "textarea",
        placeholder: "e.g. Wednesday Addams, Heath Ledger in 10 Things..."
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
          { value: "scroll", label: "I scroll forever, watch nothing" }
        ]
      },
      {
        id: "fav_era",
        text: "What's your favourite movie era?",
        type: "checkbox",
        options: [
          { value: "silent", label: "Silent Era (The Originals)" },
          { value: "1940s", label: "1940s (Shadows, Smoke & Suspense)" },
          { value: "1950s", label: "1950s (Studio Magic & Technicolor)" },
          { value: "1960s", label: "1960s (Revolution & Cool Chaos)" },
          { value: "1970s", label: "1970s (Grit, Glam & Auteur Uprising)" },
          { value: "1980s", label: "1980s (Neon, Synths & Shoulder Pads)" },
          { value: "1990s", label: "1990s (Indie Boom & VHS Royalty)" },
          { value: "2000s", label: "2000s (Tumblr-core & Teen Dreams)" },
          { value: "post2010", label: "Post-2010 (A24 & Softcore Apocalypse)" },
          { value: "fluid", label: "Era-fluid (Time is fake)" }
        ]
      },
      {
        id: "culture_background",
        text: "Where did you grow up (or feel culturally shaped by)?",
        type: "checkbox",
        options: [
          { value: "usa", label: "United States" },
          { value: "canada", label: "Canada" },
          { value: "uk_ireland", label: "United Kingdom / Ireland" },
          { value: "germany_dach", label: "Germany / Austria / Switzerland" },
          { value: "france", label: "France" },
          { value: "italy", label: "Italy" },
          { value: "spain", label: "Spain" },
          { value: "latin_america_sp", label: "Spanish-speaking Latin America" },
          { value: "brazil", label: "Brazil" },
          { value: "caribbean", label: "Caribbean / Afro-Caribbean" },
          { value: "africa_west", label: "West African" },
          { value: "africa_east_south", label: "East or Southern African" },
          { value: "asia_east", label: "Japan / Korea / China / Taiwan" },
          { value: "asia_se", label: "SE Asia (Thailand, Vietnam, etc)" },
          { value: "asia_south", label: "South Asia (India, Pakistan, etc)" },
          { value: "middle_east", label: "Middle East / Arabic / Persian" },
          { value: "eastern_europe", label: "Eastern Europe / Balkans" },
          { value: "mixed", label: "Mixed heritage / Third culture kid" },
          { value: "queer", label: "Queer culture / chosen family" }
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
          { value: "moving", label: "Always moving / never settled" }
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
        placeholder: "e.g. Bambi (shock + grief), E.T. (ugly cry)..."
      },
      {
        id: "life_changing",
        text: "What movie changed your life or meant everything at some point?",
        helpText: "We're tracking your fate film. Turning point? Breakup comfort?",
        type: "textarea",
        placeholder: "Tell us what hit you and why..."
      },
      {
        id: "comfort_watch",
        text: "Your Ultimate Comfort Watch?",
        helpText: "When you need to feel safe, soothed, or seen.",
        type: "text"
      },
      {
        id: "power_watch",
        text: "What movie do you rewatch when you want to feel powerful?",
        type: "text"
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
          { value: "glamour", label: "Theatre and glamour (Moulin Rouge)" },
          { value: "thrilling", label: "Dangerously thrilling (John Wick, Kill Bill)" },
          { value: "old_world", label: "Old world elegance (Bridgerton)" },
          { value: "gothic", label: "Gothic and strange (Pan's Labyrinth)" }
        ]
      },
      {
        id: "villain_relate",
        text: "Which villain do you secretly relate to? And... why?",
        helpText: "Who's your inner anti-hero?",
        type: "textarea",
        placeholder: "e.g. Amy Dunne, Patrick Bateman, Scar..."
      },
      {
        id: "forever_crush",
        text: "Who's your forever on-screen crush?",
        helpText: "From first movie crush to current obsession.",
        type: "textarea"
      },
      {
        id: "crave_most",
        text: "What do you crave most in a movie?",
        type: "checkbox",
        options: [
          { value: "emotional", label: "Soft, sad & deeply felt (heartbreak)" },
          { value: "tension", label: "High stakes & high tension (suspense)" },
          { value: "chaos", label: "Emotional chaos & catharsis (rage, release)" },
          { value: "clever", label: "Clever & conceptual (plot twists)" },
          { value: "structure", label: "Satisfying structure (I care about plot)" },
          { value: "poetic", label: "Philosophical & poetic (existential)" },
          { value: "depth", label: "Characters with depth (inner worlds)" },
          { value: "performance", label: "Haunting performances" },
          { value: "chemistry", label: "Sexy & slow chemistry (glances)" },
          { value: "stylish", label: "Cool & stylish (mood, music, fashion)" },
          { value: "wholesome", label: "Wholesome escapism (happy endings)" },
          { value: "worldbuilding", label: "The world it builds (immersive)" },
          { value: "fun", label: "Fun, clever & spirally" },
          { value: "weird", label: "Weird & trippy (surrealism is truth)" },
          { value: "dark", label: "Dark & seductive (noir, vampires)" },
          { value: "crime", label: "Crime, hustle & heist" }
        ]
      },
      {
        id: "life_tagline",
        text: "If your life were a movie, what would the tagline be?",
        type: "radio",
        options: [
          { value: "escape", label: "Escape was never just an option. It was the whole point." },
          { value: "ruin", label: "Love me, ruin me, roll credits." },
          { value: "hope", label: "In a world where trust is a trap... I still hope." },
          { value: "spark", label: "Just one spark. That's all it takes to unravel me." },
          { value: "style", label: "Style over safety. Every time." },
          { value: "destiny", label: "They said it was just a movie. I said: destiny." },
          { value: "glitch", label: "Reality glitched. I liked it better that way." },
          { value: "therapy", label: "It started as a meet cute. It ended in therapy." },
          { value: "villains", label: "Not all villains are wrong. Some are just iconic." },
          { value: "power", label: "Love stories? I prefer power plays in disguise." },
          { value: "hotter", label: "The world ended. I got hotter." },
          { value: "soundtrack", label: "Nothing makes sense, but the soundtrack slaps." },
          { value: "twist", label: "Just when I thought I had it figured out... plot twist." },
          { value: "fate", label: "Flirting with fate since day one." },
          { value: "coming_of_age", label: "A coming-of-age story... that never ends." },
          { value: "delusions", label: "Running on dreams and delusions." },
          { value: "script", label: "Flawed, fabulous, and still rewriting the script." },
          { value: "rules", label: "In a world that made no sense, I made my own rules." },
          { value: "loop", label: "Love, loss, reinvention. On loop." },
          { value: "survived", label: "I laughed, I cried, I survived." }
        ]
      }
    ]
  },

  // SECTION VI
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
          { value: "prestige", label: "Slow-burn prestige (HBO-core)" },
          { value: "reality", label: "Reality + chaos (Love Island, Housewives)" },
          { value: "dark", label: "Dark drama (crime, revenge, cults)" },
          { value: "comfort", label: "Comfort comedy (sitcoms)" },
          { value: "animated", label: "Animated genius (BoJack, Anime)" },
          { value: "limited", label: "Limited series / anthology (White Lotus)" },
          { value: "retro", label: "Retro magic (Golden Girls, Twin Peaks)" },
          { value: "scifi", label: "Sci-fi / fantasy world-building (GOT)" },
          { value: "docu", label: "Documentary & real stories" },
          { value: "no_tv", label: "I don't really watch TV (movie-only soul)" },
          { value: "addict", label: "I try not to watch - I get addicted" },
          { value: "avoid", label: "I avoid shows to protect my peace" }
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
          { value: "skip", label: "I skip to the dialogue" }
        ]
      },
      {
        id: "directors",
        text: "Do you care about directing styles?",
        type: "checkbox",
        helpText: "Pick up to 5.",
        options: [
          { value: "gerwig", label: "Greta Gerwig" },
          { value: "coppola", label: "Sofia Coppola" },
          { value: "peele", label: "Jordan Peele" },
          { value: "tarantino", label: "Quentin Tarantino" },
          { value: "wes_anderson", label: "Wes Anderson" },
          { value: "jenkins", label: "Barry Jenkins" },
          { value: "spike_lee", label: "Spike Lee" },
          { value: "daniels", label: "The Daniels" },
          { value: "nolan", label: "Christopher Nolan" },
          { value: "lynch", label: "David Lynch" },
          { value: "burton", label: "Tim Burton" },
          { value: "scorsese", label: "Martin Scorsese" },
          { value: "kubrick", label: "Stanley Kubrick" },
          { value: "wong_kar_wai", label: "Wong Kar-wai" },
          { value: "miyazaki", label: "Hayao Miyazaki" },
          { value: "bong_joon_ho", label: "Bong Joon-ho" },
          { value: "almodovar", label: "Pedro Almodóvar" },
          { value: "varda", label: "Agnès Varda" },
          { value: "other", label: "I don't know any directors / don't care" }
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
          { value: "rare", label: "Rare occasions only" }
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
        text: "Genres you never get sick of:",
        type: "checkbox",
        options: [
          { value: "romcom", label: "Rom-Com" },
          { value: "horror", label: "Horror / Gore" },
          { value: "drama", label: "Drama / Emotional Stories" },
          { value: "action", label: "Action/Adventure" },
          { value: "arthouse", label: "Arthouse / Indie" },
          { value: "scifi", label: "Sci-fi/Futurism" },
          { value: "mystery", label: "Mystery / Suspense" },
          { value: "biopics", label: "Biopics" },
          { value: "camp", label: "Camp/Cult/Iconic Chaos" },
          { value: "true_crime", label: "True Crime" },
          { value: "period", label: "Historical / Period" },
          { value: "queer", label: "Queer Cinema" },
          { value: "fantasy", label: "Fantasy" },
          { value: "documentary", label: "Documentary" },
          { value: "thriller", label: "Psychological / Twisted / Thrillers" }
        ]
      },
      {
        id: "turn_offs",
        text: "What do you NOT vibe with on screen?",
        type: "checkbox",
        options: [
          { value: "sad", label: "No sad endings, please." },
          { value: "romcom_cringe", label: "Rom-coms? I'm a realist." },
          { value: "scary", label: "I don't do scary." },
          { value: "sexual", label: "Too steamy/sexual makes me uncomfortable." },
          { value: "gore", label: "Too gory/violent? I'm out." },
          { value: "torture", label: "No torture, please (Saw, etc)." },
          { value: "snobbery", label: "No prestige snobbery (award bait)." },
          { value: "no_romance", label: "If no romance, I lose interest." },
          { value: "no_sex", label: "If no sex/skin, I get bored." },
          { value: "scifi_hate", label: "I hate sci-fi / fantasy." },
          { value: "clowns", label: "Can't do clowns. Ever." },
          { value: "reality_rot", label: "Reality TV rots my brain." },
          { value: "marvel", label: "I don't do Marvel." },
          { value: "subtitles", label: "I don't like subtitles." }
        ]
      },
      {
        id: "hated_film",
        text: "What's a film everyone else loved... but you hated?",
        helpText: "The Oscar darling that bored you? The cult classic you found cringe?",
        type: "textarea",
        placeholder: "e.g. Titanic, Everything Everywhere All at Once, Avatar..."
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
        text: "Who’s your cinematic twin flame, alter ego, or misunderstood legend?",
        helpText: "Type your answer (e.g., Fleabag, Amélie, Tony Soprano...)",
        type: "text",
        uiType: "hero_card" // Hint for frontend to render this specially
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
          { value: "dubbed", label: "As long as it's dubbed, I'm fine" }
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
        text: "How do you actually choose your next movie or show?",
        type: "checkbox",
        options: [
          { value: "notes", label: "I write chaotic lists in my Notes app" },
          { value: "letterboxd", label: "I use Letterboxd / IMDb" },
          { value: "scroll", label: "I scroll Netflix until something clicks" },
          { value: "top10", label: "I trust the Top 10" },
          { value: "friend", label: "I ask my film friend" },
          { value: "chatgpt", label: "I ask ChatGPT" },
          { value: "reviews", label: "I read reviews (IndieWire, NYT)" },
          { value: "vibes", label: "Mood / aesthetic (vibes > plot)" },
          { value: "fateflix", label: "I'm just waiting for FateFlix to drop" }
        ]
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
          { value: "cosmic", label: "Cosmic Calling" }
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
        id: "top3_films",
        text: "TOP 3 FILMS ★★★★★",
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
