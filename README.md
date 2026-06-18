# Cyber Incident Response Case Manager

Cyber Incident Response Case Manager is a prototype for organizing cybersecurity incident information in one place.

It helps track:

    - incidents
    - evidence and artifacts
    - indicators
    - affected assets
    - related entities
    - timeline events
    - response actions
    - MITRE ATT&CK mappings
    - basic incident reports

## How to Use

Open `index.html` in a web browser.

The prototype includes fictional sample data so the interface can be tested without adding real incident information.

## How to Run Locally

From the project folder, you can also run a local web server:

```powershell```

    python -m http.server 8765 --bind 127.0.0.1

Then open:

http://127.0.0.1:8765/