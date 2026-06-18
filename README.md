# Cyber Incident Response Case Manager

Cyber Incident Response Case Manager is a browser-based tool for organizing and responding to cybersecurity incidents. It provides a centralized workspace for tracking incidents, evidence, timelines, response actions, indicators, assets, entities, MITRE ATT&CK mappings, and incident reports.

## Features

- Incident management
- Evidence and artifact tracking
- Timeline building
- Response action tracking
- Indicators and affected assets
- Related entities
- MITRE ATT&CK mapping with links to official MITRE pages
- Role-based views through a local role switcher
- Customizable dashboard cards
- Color-coded severity and criticality
- Incident report preview
- Mock connector views
- Browser `localStorage` persistence

## Getting Started

Option 1: open `index.html` directly in a browser.

Option 2: run a local web server if Python is available:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Testing

- Open the app.
- Switch roles with the local role switcher.
- Customize dashboard cards.
- Click incidents and linked records.
- Preview an incident report.
- Click MITRE ATT&CK links and confirm they open in a new tab.
- Confirm mock connectors are clearly non-live.

## Architecture

- Frontend: HTML5, CSS3, vanilla JavaScript
- Storage: browser `localStorage`
- Data format: JSON
- Dependencies: none
- Build process: none

## Status & Limitations

This is an educational prototype with pre-loaded sample incidents for exploration.

- Browser storage only
- No backend
- No real authentication
- Role switcher is for exploring views, not backend-enforced RBAC
- No real API integrations
- No secure evidence storage
- Do not use for real sensitive incident data without proper backend security controls
