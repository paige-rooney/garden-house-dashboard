import { PortfolioItem, Testimonial } from "@/lib/types";

export const site = {
  name: "Garden House Recording Studios",
  shortName: "Garden House",
  tagline: "Growing Upwards Together.",
  about:
    "Songs are seeds. At Garden House Recording Studios, we don't just hit record. We collaborate with creatives to grow something meaningful. Whether you come with a new idea or a fully-formed vision, we take your songs from worktape to record — from raw to rooted.",
  location: "Brentwood, TN",
  email: "hello@gardenhouserecordingstudios.com",
  instagram: "gardenhouse_recordingstudios",
  instagramUrl: "https://instagram.com/gardenhouse_recordingstudios",
};

export const ourStory = {
  mission:
    "Music is not meant to be made alone. Garden House exists to create deeper community in the music industry. Whether you’re an artist, writer, producer, engineer, or musician, there’s a place at Garden House for your art and your skills. We prioritize collaboration at every stage of the process. When you bring your work to Garden House, you direct the vision, and our team works alongside you to bring that vision to life. Let’s grow upwards together.",
  values: [
    {
      name: "Community",
      description: "because collaboration unlocks new potential",
    },
    {
      name: "Creativity",
      description: "because great art has great impact",
    },
    {
      name: "Cultivation",
      description: "because where you’re planted affects how you grow",
    },
  ],
  whatWeDo: [
    "Songs are seeds. At Garden House Recording Studios, we don't just hit record. We collaborate with creatives to grow something meaningful. Whether you come with a new idea or a fully-formed vision, we take your songs from worktape to record — from raw to rooted.",
    "We host community events and partner with artists for recording, production, and mixing — supporting long-term growth, not just a single session.",
  ],
  founder: {
    name: "Paige Rooney",
    role: "Founder, owner, and executive producer",
    bio: "Paige Rooney, founder/owner/executive producer, started Garden House to fill a gap in the music industry. During her time studying Songwriting and Audio Engineering Technology at Belmont University, she noticed that many people in the industry work as their own islands. Collaboration and genuine support for creatives’ goals and vision was lacking. After graduating, she launched Garden House Recording Studios with the mission to connect creatives, strengthen community, and cultivate excellent music. She combined her love of people, plants, and production to create an environment where artists feel supported in their art and encouraged to create. She believes that nothing worth doing should ever be done alone, and when you have good soil to root yourself in, and good people to grow alongside, the impact of your art increases exponentially.",
  },
};

export const services = [
  {
    name: "Recording & Production",
    description:
      "Collaborate with our team in a supportive studio environment, where each track builds your sound and crafts your vision.",
    image: "/services/recording.jpg",
    imageAlt: "Artist recording vocals in the studio",
  },
  {
    name: "Mixing",
    description:
      "Bring your songs to the next level with a polished mix. Grow in your art and fuel your creativity.",
    image: "/services/mixing.jpg",
    imageAlt: "Mixing console in a recording studio",
  },
  {
    name: "Editing & Vocal Tuning",
    description:
      "Professional editing and vocal tuning services to prepare your recorded stems for the mix phase.",
    image: "/services/editing.jpg",
    imageAlt: "Studio session prepared for editing and vocal tuning",
  },
  {
    name: "Events",
    description:
      "Connect with other creatives and grow upwards together. See our socials for upcoming studio events.",
    image: "/services/events.jpg",
    imageAlt: "Live music event with an audience",
  },
];

export const portfolio: PortfolioItem[] = [
  {
    id: "damage-control",
    artist: "Jessie Godfrey",
    projectTitle: "Damage Control",
    cover: "/portfolio/damage-control.svg",
    spotifyUrl: "https://open.spotify.com/search/Damage%20Control%20Jessie%20Godfrey",
    appleMusicUrl: "https://music.apple.com/us/search?term=Damage%20Control%20Jessie%20Godfrey",
  },
  {
    id: "myoldman",
    artist: "Callen Garza",
    projectTitle: "myoldman",
    cover: "/portfolio/myoldman.jpg",
    spotifyUrl: "https://open.spotify.com/track/3xbRffsw4mkA1FeMHywd53",
    appleMusicUrl: "https://music.apple.com/us/album/myoldman/1869481518?i=1869481520",
  },
  {
    id: "bluedress",
    artist: "Callen Garza",
    projectTitle: "bluedress",
    cover: "/portfolio/bluedress.jpg",
    spotifyUrl: "https://open.spotify.com/track/4ev6FACVIvVa3VeOlG1VWI",
    appleMusicUrl: "https://music.apple.com/us/album/bluedress/1877772444?i=1877772445",
  },
  {
    id: "hot-n-cold",
    artist: "Mallory Fischer",
    projectTitle: "Hot n Cold",
    cover: "/portfolio/hot-n-cold.jpg",
    spotifyUrl: "https://open.spotify.com/track/4oodk0bQzU5pZgPfT1exYw",
    appleMusicUrl: "https://music.apple.com/us/album/hot-n-cold/1845126593?i=1845126987",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "What Paige is creating with Garden House is truly something special. I love working with her because there’s so much focus on authenticity and collaboration. It’s how making music should be.",
    name: "Greyson Gainey",
  },
  {
    id: "t2",
    quote:
      "Creating with Garden House has been one of my favorite parts of making music. Paige has created such a welcoming environment that taps into a part of creativity that reminds me why I love music to begin with in the way it brings community together and connects us all on such a deep level. Garden House has all-around brought my projects and music to life in such a meaningful way.",
    name: "MK Fischer",
  },
  {
    id: "t3",
    quote:
      "I had the privilege of recording at Garden House during its early beginnings, and even then, I could see that it had the potential to become something special. What started as a work in progress has grown into a space where artists can create freely, connect with one another, and be part of a community that makes you want to keep coming back.",
    name: "Grant Morgan",
  },
];
