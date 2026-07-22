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
  background:
    "Garden House Recording Studios is based in Brentwood, south of Nashville. We exist to help music creatives sharpen their craft, collaborate with intention, and release work that feels rooted and true.",
  values: [
    "Creating spaces for music industry creatives to improve their skills.",
    "Building collaborative environments for songwriting and production.",
    "Cultivating each artist's unique sound and artistry.",
  ],
  mission:
    "We host community events and partner with artists for recording, production, and mixing — supporting long-term growth, not just a single session.",
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
    name: "Events",
    description:
      "Connect with other creatives and grow upwards together. See our socials for upcoming studio events.",
    image: "/services/events.jpg",
    imageAlt: "Live music event with an audience",
  },
];

// Placeholder credits — replace with real projects when ready.
export const portfolio: PortfolioItem[] = [
  {
    id: "pf1",
    artist: "Maya Hill",
    projectTitle: "Late Bloom",
    service: "Production + Mix",
  },
  {
    id: "pf2",
    artist: "Cedar Lane",
    projectTitle: "Homegrown EP",
    service: "Mixing",
  },
  {
    id: "pf3",
    artist: "Knox Wilder",
    projectTitle: "Southbound",
    service: "Cowrite + Production",
  },
];

// Placeholder quotes — replace with real testimonials when ready.
export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "Garden House gave me the clarity and confidence to release my best songs.",
    name: "Maya Hill",
    role: "Independent Artist",
  },
  {
    id: "t2",
    quote:
      "The collaboration process felt intentional, musical, and deeply supportive.",
    name: "Cedar Lane",
    role: "Singer-Songwriter",
  },
];
