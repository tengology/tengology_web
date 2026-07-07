import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/storefront/Reveal";
import type { Metadata } from "next";

// Revalidate via ISR: only the layout's shipping ticker is DB-driven here.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About",
  description:
    "The story behind Tengology — from wool felt to crystals, every piece is curated by hand in England with intention and care.",
};

const values = [
  {
    title: "Natural Materials",
    body: "Wool felt, wood, crystals, natural stone. I choose materials that come from the earth and feel alive in your hands. No plastic, no shortcuts.",
  },
  {
    title: "Intention",
    body: "Every piece begins with purpose. From the colour I choose to the stone I select, nothing is random. I want you to feel that intention the moment it touches your skin.",
  },
  {
    title: "Energy",
    body: "I believe handmade things carry the energy of the person who shaped them. Each piece passes through my hands with care, focus, and a genuine wish for whoever receives it.",
  },
  {
    title: "Craftsmanship",
    body: "No machines, no mass production. Just patient, skilled handwork. The small imperfections aren’t flaws — they’re proof that a real person made this, just for you.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-muted">
        <Image
          src="/products/strawberries/flat-lay-top.jpg"
          alt="Strawberry felt accessories photographed together on a white surface"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-45 motion-safe:animate-[hero-zoom_14s_var(--ease-soft)_forwards]"
        />
        <div className="absolute inset-0 bg-background/45" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-32">
          <p className="eyebrow mb-5">The story</p>
          <h1 className="font-heading text-6xl leading-[0.95] sm:text-7xl lg:text-8xl">
            Where texture
            <br />
            meets <em>energy</em>
          </h1>
        </div>
      </section>

      {/* Opening */}
      <section className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <Reveal>
          <p className="text-lg leading-relaxed text-muted-foreground first-letter:float-left first-letter:mr-3 first-letter:font-heading first-letter:text-6xl first-letter:leading-[0.8] first-letter:text-foreground">
            For as long as I can remember, I&rsquo;ve been someone who
            curates &mdash; drawn to beautiful materials, textures, and the
            quiet art of bringing them together into something you can feel.
            Give me a quiet afternoon, some natural materials, and a spark
            of an idea, and I&rsquo;m happy. There&rsquo;s something in the
            rhythm of working with your hands &mdash; the selecting, the
            shaping, the stitching &mdash; that nothing else in life quite
            matches. It&rsquo;s a sensory experience, from first touch to
            finished piece. Curating isn&rsquo;t just what I do. It&rsquo;s
            how I think, how I unwind, how I make sense of the world.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Tengology grew from that love. It started with wool felt: soft,
            honest, full of warmth. And it grew into something I never
            expected.
          </p>
        </Reveal>
      </section>

      {/* Chapter 1: Wool Felt */}
      <section className="border-t">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid items-start gap-10 lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-2">
              <p className="eyebrow mb-4">
                <span className="mr-3 text-foreground">01</span>
                Chapter one
              </p>
              <h2 className="mb-8 font-heading text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">
                The wool felt <em>years</em>
              </h2>
              <Reveal variant="left">
                <div className="relative aspect-[3/4] overflow-hidden rounded-none bg-muted">
                  <Image
                    src="/products/dahlia/dahlia-collection.jpg"
                    alt="Handmade felt flower headbands photographed on a pale blue surface"
                    fill
                    sizes="(max-width: 1024px) 100vw, 34vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            </div>
            <Reveal
              delay={150}
              className="space-y-5 leading-relaxed text-muted-foreground lg:col-span-3"
            >
              <p>
                I grew up watching my mother&rsquo;s hands. She was the kind
                of person who was always making something &mdash; whatever
                craft was popular at the time, she&rsquo;d be doing it. She
                used to take me to craft shops and fabric stores, and most
                of my childhood was spent in those two places. She even made
                clothes for my Barbie dolls by hand. That was my normal.
              </p>
              <p>
                So when I first picked up a sheet of wool felt years later,
                something clicked. The way it holds its shape, the richness
                of its colour, the warmth of it between my fingers &mdash;
                it was a sensory experience before it was anything else.
                I began with hair accessories: bows, clips, headbands.
                Small things, but each one given the kind of attention that
                only someone who grew up in craft shops understands.
              </p>
              <p>
                Before long, I was at craft shows across England, meeting
                the people who wore my pieces. Mothers buying clips for their
                daughters. Women choosing brooches to brighten a winter coat.
                Every conversation reminded me why I do this &mdash; to bring
                a little bit of handmade joy into someone&rsquo;s day.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Chapter 2: Crystals */}
      <section className="border-t">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid items-start gap-10 lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-2">
              <p className="eyebrow mb-4">
                <span className="mr-3 text-foreground">02</span>
                Chapter two
              </p>
              <h2 className="mb-8 font-heading text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">
                Discovering <em>crystals</em>
              </h2>
              <Reveal variant="left">
                <div className="relative aspect-[3/4] overflow-hidden rounded-none bg-muted">
                  <Image
                    src="/products/comet/clear-quartz-star-cluster-earrings-hero.jpg"
                    alt="Clear quartz star cluster earrings photographed on a neutral surface"
                    fill
                    sizes="(max-width: 1024px) 100vw, 34vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            </div>
            <Reveal
              delay={150}
              className="space-y-5 leading-relaxed text-muted-foreground lg:col-span-3"
            >
              <p>
                I remember the first time I felt crystal energy. I was young,
                visiting a crystal shop that had an enormous amethyst geode
                &mdash; the kind you could fit your whole arm inside. The
                shop owner asked me to place my hand inside. I felt something
                I&rsquo;d never felt before: a tingling at my fingertips,
                almost like tiny needles pressing gently against my skin. A
                strange, subtle numbness. I was hooked.
              </p>
              <p>
                When I was fifteen, I bought my first crystal &mdash; an
                amethyst pendant. I&rsquo;d heard it could help with focus
                and studies, so I wore it to school every single day. And it
                did help. I felt calmer, more centred. I wore that amethyst
                right through to my final exams.
              </p>
              <p>
                The day after my last exam, I was in the school bathroom and
                the chain simply snapped. The amethyst fell and was gone
                before I could catch it. I couldn&rsquo;t get it back. But
                strangely, I wasn&rsquo;t upset. It felt like the crystal
                was telling me its work was done &mdash; it had carried me
                through, and now it was time for it to go. That was the
                moment I understood that crystals aren&rsquo;t just
                beautiful objects. They carry something. They hold intention,
                and when that intention is fulfilled, they move on.
              </p>
              <p>
                Years later, when I began working with crystal beads
                &mdash; threading them into bracelets and necklaces, choosing
                each stone for its colour, its energy, its feel against the
                skin &mdash; I brought that belief with me. Every crystal
                has its own character. My job isn&rsquo;t to overpower that.
                It&rsquo;s to honour it, and to pass it on to someone who
                needs it.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Chapter 3: Batik */}
      <section className="border-t">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid items-start gap-10 lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-2">
              <p className="eyebrow mb-4">
                <span className="mr-3 text-foreground">03</span>
                Chapter three
              </p>
              <h2 className="mb-8 font-heading text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">
                Batik &amp; <em>belonging</em>
              </h2>
              <Reveal variant="left">
                <div className="relative aspect-[3/4] overflow-hidden rounded-none bg-muted">
                  <Image
                    src="/products/comet/pearl-carnelian-cluster-earrings-hero.jpg"
                    alt="Pearl and carnelian cluster earrings photographed on a neutral surface"
                    fill
                    sizes="(max-width: 1024px) 100vw, 34vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            </div>
            <Reveal
              delay={150}
              className="space-y-5 leading-relaxed text-muted-foreground lg:col-span-3"
            >
              <p>
                I was born in Sabah, Malaysia &mdash; right on the edge of
                Borneo, close enough to Indonesia that the cultures blend
                into one another. Growing up, Batik was everywhere. Not the
                Malaysian style most people picture, but Indonesian Batik
                &mdash; bolder, more intricate, with flowers and patterns
                that feel almost alive on the cloth.
              </p>
              <p>
                When I moved to England, I carried that with me. And
                eventually I began to wonder: what if I could wear those
                patterns differently? I started cutting individual flowers
                from Batik fabric, adding tiny beads for detail, and turning
                them into earrings and brooches. Each piece is like
                preserving a small fragment of the culture I grew up in
                &mdash; something traditional, reimagined into something you
                can pin to a lapel or wear to dinner.
              </p>
              <p>
                There&rsquo;s a particular joy in working with Batik. The
                fabric is already a work of art &mdash; hand-stamped or
                hand-drawn by artisans. My role is to select the most
                beautiful sections and give them a second life as jewellery.
                It feels like a conversation between two sets of hands,
                separated by thousands of miles.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Chapter 4: Stained Glass */}
      <section className="border-t">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid items-start gap-10 lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-2">
              <p className="eyebrow mb-4">
                <span className="mr-3 text-foreground">04</span>
                Chapter four
              </p>
              <h2 className="mb-8 font-heading text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">
                My father&rsquo;s
                <br />
                <em>glass</em>
              </h2>
              <Reveal variant="left">
                <div className="relative aspect-[3/4] overflow-hidden rounded-none bg-muted">
                  <Image
                    src="/products/comet/green-fluorite-cluster-drop-earrings-hero.jpg"
                    alt="Green fluorite cluster drop earrings photographed on a neutral surface"
                    fill
                    sizes="(max-width: 1024px) 100vw, 34vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            </div>
            <Reveal
              delay={150}
              className="space-y-5 leading-relaxed text-muted-foreground lg:col-span-3"
            >
              <p>
                My father ran a glass shop. I grew up surrounded by sheets
                of colour &mdash; light pouring through textured panes,
                casting patterns across the floor that shifted with the time
                of day. I didn&rsquo;t think of it as beautiful back then.
                It was just the world I knew.
              </p>
              <p>
                Years later, the idea arrived the way they always do: what
                if I could take leftover pieces of his begonia-patterned
                stained glass and turn them into something wearable? I began
                cutting the glass into small shapes &mdash; teardrops,
                circles, petals &mdash; and using traditional stained glass
                soldering techniques to set them into earrings and pendants.
              </p>
              <p>
                Every piece in this collection carries something of my
                father&rsquo;s trade in it. The glass has texture you can
                feel under your fingertips, and when light passes through
                it, it glows the way I remember it glowing in his shop. Of
                all the things I create, this is the collection closest to
                my heart.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* The Thread: The Connection */}
      <section className="border-t">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid items-start gap-10 lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-2">
              <p className="eyebrow mb-4">
                <span className="mr-3 text-foreground">05</span>
                The thread
              </p>
              <h2 className="font-heading text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">
                What connects
                <br />
                <em>everything</em>
              </h2>
            </div>
            <Reveal
              delay={150}
              className="space-y-5 leading-relaxed text-muted-foreground lg:col-span-3"
            >
              <p>
                Wool felt, crystals, Batik, stained glass &mdash; people
                sometimes ask how they all belong together. To me, the
                answer has always been obvious: every collection starts with
                a material that means something. Something I&rsquo;ve
                touched, grown up with, or inherited.
              </p>
              <p>
                Wool felt is the warmth I found in England. Crystals are the
                earth&rsquo;s quiet energy. Batik is the culture I carried
                with me from Sabah. Stained glass is my father&rsquo;s
                legacy. They&rsquo;re different materials, but they arrive
                in my hands the same way &mdash; with their own texture,
                colour, and story &mdash; and they leave as something
                personal, something you choose to wear because it means
                something to you.
              </p>
              <p>
                That&rsquo;s what Tengology is really about. Not a category
                of product, but a way of curating &mdash; selecting
                meaningful materials and shaping them by hand into pieces
                that are designed to be felt as much as they are seen. Every
                piece is a sensory experience, and every one is designed and
                crafted by hand in England.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <p className="eyebrow mb-4">
            <span className="mr-3 text-foreground">06</span>
            The values
          </p>
          <h2 className="mb-12 font-heading text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">
            What I believe <em>in</em>
          </h2>
          <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {values.map((value, i) => (
              <Reveal key={value.title} delay={(i % 2) * 80}>
                <div className="border-t pt-5">
                  <h3 className="eyebrow mb-3 !text-foreground">{value.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {value.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-32">
          <Reveal>
            <h2 className="mb-6 font-heading text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">
              Come and see for <em>yourself</em>
            </h2>
            <p className="mx-auto mb-10 max-w-lg leading-relaxed text-muted-foreground">
              Whether you&rsquo;re drawn to the softness of wool felt or the
              quiet power of crystals, there&rsquo;s something here that was
              made with you in mind.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="eyebrow inline-flex items-center justify-center border border-foreground bg-foreground px-8 py-3.5 !text-background transition-colors hover:bg-transparent hover:!text-foreground"
              >
                Shop the collection
              </Link>
              <Link
                href="/pages/contact"
                className="eyebrow inline-flex items-center justify-center border px-8 py-3.5 transition-colors hover:border-foreground hover:!text-foreground"
              >
                Get in touch
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
