"use client";

import { Chrome, Globe, Github, Download, ExternalLink, FileCode2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// These should be replaced with actual store URLs when published
const CHROME_STORE_URL = "#"; // Will be the Chrome Web Store URL
const FIREFOX_STORE_URL = "#"; // Will be the Firefox Add-ons URL
const GITHUB_RELEASES_URL = "https://github.com/tashifkhan/MOOC-utils/releases";

export function ExtensionDownload() {
  return (
    <section className="py-24 relative" id="extension">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,oklch(0.35_0.08_183/0.1),transparent)]" />
      </div>

      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-chart-4/10 text-chart-4 text-sm font-medium mb-4">
            <FileCode2 className="w-4 h-4" />
            Browser Extension
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Get the Assignment Solver
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Install directly from browser stores or manually from GitHub releases
          </p>
        </div>

        {/* Store downloads */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
          <StoreCard
            icon={<Chrome className="w-8 h-8" />}
            store="Chrome Web Store"
            description="For Chrome, Edge, Brave, and Chromium browsers"
            url={CHROME_STORE_URL}
            available={false}
          />
          <StoreCard
            icon={<Globe className="w-8 h-8" />}
            store="Firefox Add-ons"
            description="For Firefox and Firefox-based browsers"
            url={FIREFOX_STORE_URL}
            available={false}
          />
        </div>

        {/* Manual installation */}
        <Card className="max-w-2xl mx-auto bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Github className="w-5 h-5" />
              Manual Installation
            </CardTitle>
            <CardDescription>
              Download from GitHub releases and load as an unpacked extension
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Steps */}
            <div className="space-y-4">
              <Step number={1} title="Download the latest release">
                <p className="text-sm text-muted-foreground mb-3">
                  Get the ZIP file for your browser from the releases page
                </p>
                <a
                  href={GITHUB_RELEASES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  <Download className="w-4 h-4 mr-2" />
                  GitHub Releases
                  <ExternalLink className="w-3 h-3 ml-2" />
                </a>
              </Step>

              <Step number={2} title="Extract the ZIP file">
                <p className="text-sm text-muted-foreground">
                  Unzip to a folder you{"'"}ll keep (don{"'"}t delete it after loading)
                </p>
              </Step>

              <Step number={3} title="Load in your browser">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex gap-3">
                    <Chrome className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium text-foreground">Chrome: </span>
                      Go to <code className="px-1.5 py-0.5 rounded bg-muted text-xs">chrome://extensions</code>,
                      enable Developer mode, click {'"'}Load unpacked{'"'}, select the extracted folder
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Globe className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium text-foreground">Firefox: </span>
                      Go to <code className="px-1.5 py-0.5 rounded bg-muted text-xs">about:debugging</code>,
                      click {'"'}This Firefox{'"'}, {'"'}Load Temporary Add-on{'"'}, select the manifest.json
                    </div>
                  </div>
                </div>
              </Step>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function StoreCard({
  icon,
  store,
  description,
  url,
  available,
}: {
  icon: React.ReactNode;
  store: string;
  description: string;
  url: string;
  available: boolean;
}) {
  const buttonContent = (
    <>
      <Download className="w-4 h-4 mr-2" />
      Install
    </>
  );

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 ${available ? "hover:border-primary/30 hover:-translate-y-1" : "opacity-60"}`}>
      {!available && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
          Coming Soon
        </div>
      )}
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-chart-4 to-chart-5 flex items-center justify-center text-white">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold mb-1">{store}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {available ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "default" }), "w-full")}
            >
              {buttonContent}
            </a>
          ) : (
            <button
              disabled
              className={cn(buttonVariants({ variant: "default" }), "w-full opacity-50 cursor-not-allowed")}
            >
              {buttonContent}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
        {number}
      </div>
      <div className="pt-1 flex-1">
        <h4 className="font-medium mb-2">{title}</h4>
        {children}
      </div>
    </div>
  );
}
