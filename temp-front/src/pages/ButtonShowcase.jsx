import React from "react";
import Button from "../components/ui/Button";
import {
  ArrowRight, ArrowLeft, Check, X, Save, Trash2, Settings,
  ExternalLink, Plus
} from "lucide-react";

export default function ButtonShowcase() {
  return (
    <div className="container mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Button Showcase</h1>
        <p className="opacity-70">All common buttons, side by side.</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Intents */}
        <section className="card bg-base-200 shadow-md">
          <div className="card-body">
            <h2 className="card-title text-base">Intents</h2>
            <div className="flex flex-wrap gap-2">
              <Button intent="submit">Submit</Button>
              <Button intent="ok" leftIcon={Check}>OK</Button>
              <Button intent="cancel" variant="outline" leftIcon={X}>Cancel</Button>
              <Button intent="next" rightIcon={ArrowRight}>Next</Button>
              <Button intent="back" leftIcon={ArrowLeft} variant="ghost">Back</Button>
              <Button intent="delete" leftIcon={Trash2}>Delete</Button>
              <Button intent="save" leftIcon={Save}>Save</Button>
            </div>
          </div>
        </section>

        {/* Variants */}
        <section className="card bg-base-200 shadow-md">
          <div className="card-body">
            <h2 className="card-title text-base">Variants</h2>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="info">Info</Button>
              <Button variant="neutral">Neutral</Button>
              <Button variant="outline" leftIcon={Settings}>Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="subtle">Subtle</Button>
              <Button variant="link" rightIcon={ExternalLink}>Link</Button>
            </div>
          </div>
        </section>

        {/* Sizes */}
        <section className="card bg-base-200 shadow-md">
          <div className="card-body">
            <h2 className="card-title text-base">Sizes</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="xs">XS</Button>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>
        </section>

        {/* States */}
        <section className="card bg-base-200 shadow-md">
          <div className="card-body">
            <h2 className="card-title text-base">States</h2>
            <div className="flex flex-col gap-2">
              <Button loading loadingText="Saving…" leftIcon={Save}>Save</Button>
              <Button disabled variant="outline">Disabled</Button>
              <Button block intent="submit" type="submit">Block / Full Width</Button>
            </div>
          </div>
        </section>

        {/* Icon-only + Toolbar */}
        <section className="card bg-base-200 shadow-md">
          <div className="card-body">
            <h2 className="card-title text-base">Icon Only / Toolbar</h2>
            <div className="flex flex-wrap gap-2">
              <Button iconOnly leftIcon={Plus} aria-label="Add" />
              <Button iconOnly leftIcon={Settings} aria-label="Settings" />
              <Button iconOnly leftIcon={Trash2} variant="outline" aria-label="Delete" />
            </div>
            <div className="join mt-2">
              <Button joined variant="outline" leftIcon={ArrowLeft}>Prev</Button>
              <Button joined intent="next" rightIcon={ArrowRight}>Next</Button>
            </div>
          </div>
        </section>

        {/* Links */}
        <section className="card bg-base-200 shadow-md">
          <div className="card-body">
            <h2 className="card-title text-base">Links</h2>
            <div className="flex flex-wrap gap-2">
              <Button to="/dashboard" rightIcon={ArrowRight}>Go to Dashboard</Button>
              <Button href="https://example.com" rightIcon={ExternalLink} target="_blank" rel="noreferrer">
                External Link
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
