"""
Génère un CV PDF de base à partir des seules informations professionnelles
confirmées. Ce fichier est un espace réservé fonctionnel : le bouton
"Télécharger le CV" du site pointe vers /cv.pdf et doit renvoyer un vrai
fichier dès la mise en ligne. Remplacez ce PDF par le CV définitif de
Camille dès qu'il est disponible.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_LEFT

INK = colors.HexColor("#141815")
MOSS = colors.HexColor("#5B665C")
CANOPY = colors.HexColor("#2E8158")
LINE = colors.HexColor("#E4E8E3")

styles = getSampleStyleSheet()

name_style = ParagraphStyle("name", parent=styles["Title"], fontName="Helvetica-Bold",
                             fontSize=24, textColor=INK, alignment=TA_LEFT, spaceAfter=2)
title_style = ParagraphStyle("jobtitle", parent=styles["Normal"], fontName="Helvetica",
                              fontSize=12.5, textColor=CANOPY, spaceAfter=10)
contact_style = ParagraphStyle("contact", parent=styles["Normal"], fontName="Helvetica",
                                fontSize=9.5, textColor=MOSS, spaceAfter=14)
h2_style = ParagraphStyle("h2", parent=styles["Heading2"], fontName="Helvetica-Bold",
                           fontSize=11.5, textColor=INK, spaceBefore=16, spaceAfter=6,
                           letterSpacing=0.6)
body_style = ParagraphStyle("body", parent=styles["Normal"], fontName="Helvetica",
                             fontSize=10, textColor=INK, leading=14.5, spaceAfter=4)
entry_title_style = ParagraphStyle("entrytitle", parent=styles["Normal"], fontName="Helvetica-Bold",
                                    fontSize=10.5, textColor=INK, spaceAfter=1)
entry_meta_style = ParagraphStyle("entrymeta", parent=styles["Normal"], fontName="Helvetica-Oblique",
                                   fontSize=9, textColor=MOSS, spaceAfter=3)
note_style = ParagraphStyle("note", parent=styles["Normal"], fontName="Helvetica-Oblique",
                             fontSize=8.3, textColor=MOSS, spaceBefore=18)

doc = SimpleDocTemplate(
    "/home/claude/site/cv.pdf",
    pagesize=A4,
    topMargin=22 * mm, bottomMargin=18 * mm,
    leftMargin=20 * mm, rightMargin=20 * mm,
    title="CV — Camille Perraudeau",
    author="Camille Perraudeau",
)

story = []

story.append(Paragraph("Camille Perraudeau", name_style))
story.append(Paragraph("Technicien forestier &amp; Développeur SIG / IA", title_style))
# À personnaliser : remplacez par vos coordonnées réelles
story.append(Paragraph(
    "contact@camille-perraudeau.fr &nbsp;·&nbsp; 06 00 00 00 00 &nbsp;·&nbsp; Poitiers, Nouvelle-Aquitaine "
    "&nbsp;·&nbsp; github.com/camille-perraudeau &nbsp;·&nbsp; linkedin.com/in/camille-perraudeau",
    contact_style))
story.append(HRFlowable(width="100%", thickness=1, color=LINE, spaceAfter=4))

story.append(Paragraph("PROFIL", h2_style))
story.append(Paragraph(
    "Technicien forestier diplômé (BTSA Gestion Forestière, mention Assez Bien, 2026) et "
    "développeur autodidacte. Plus de 31 semaines d'expérience de terrain à l'Office National "
    "des Forêts. Conçoit GeoSylva Intelligence Engine (GSIE), une plateforme de cartographie "
    "SIG et d'intelligence artificielle pour la gestion forestière.",
    body_style))

story.append(Paragraph("EXPÉRIENCE", h2_style))
story.append(Paragraph("Stage technicien forestier — Office National des Forêts", entry_title_style))
story.append(Paragraph("UT Charente Sud – Deux-Sèvres &nbsp;·&nbsp; plus de 31 semaines", entry_meta_style))
story.append(Paragraph(
    "Cartographies réglementaires, enquête après incendie (RCCI), intervention réelle lors "
    "d'un feu de forêt à Chizé, proposition d'un dispositif de surveillance par drone et IA. "
    "Rôle de référent numérique auprès des équipes.",
    body_style))
story.append(Spacer(1, 6))
story.append(Paragraph("Fondateur — activité indépendante (micro-entreprise)", entry_title_style))
story.append(Paragraph("Poitiers &nbsp;·&nbsp; depuis août 2026", entry_meta_style))
story.append(Paragraph(
    "Développement de logiciels de traitement de données forestières, autour du projet GeoSylva "
    "Intelligence Engine (GSIE).",
    body_style))

story.append(Paragraph("FORMATION", h2_style))
story.append(Paragraph("BTSA Gestion Forestière — mention Assez Bien", entry_title_style))
story.append(Paragraph("2026", entry_meta_style))

story.append(Paragraph("PROJET TECHNIQUE", h2_style))
story.append(Paragraph("GeoSylva Intelligence Engine (GSIE)", entry_title_style))
story.append(Paragraph(
    "Plateforme de collecte, d'analyse et de synchronisation intelligente des données "
    "forestières : cartographie SIG (MapLibre), fonctionnement offline-first "
    "(Room / SQLCipher), réseau mesh LoRa / Meshtastic, modules d'aide à la décision par IA.",
    body_style))

story.append(Paragraph("COMPÉTENCES", h2_style))
skills_table = Table([[
    Paragraph("Langages &amp; frameworks<br/><font color='#5B665C' size=8.5>Python, TypeScript, Kotlin, Java, FastAPI</font>", body_style),
    Paragraph("SIG &amp; terrain<br/><font color='#5B665C' size=8.5>QGIS, cartographie réglementaire, cubage</font>", body_style),
    Paragraph("Systèmes &amp; réseaux<br/><font color='#5B665C' size=8.5>Linux, Docker, Git, Arduino, LoRa</font>", body_style),
]], colWidths=[54 * mm, 54 * mm, 54 * mm])
skills_table.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ("RIGHTPADDING", (0, 0), (-1, -1), 10),
]))
story.append(skills_table)

story.append(Paragraph(
    "Document généré automatiquement à partir des informations professionnelles confirmées. "
    "Remplacez ce fichier (/cv.pdf) par votre CV définitif avant la mise en ligne.",
    note_style))

doc.build(story)
print("CV placeholder généré : /home/claude/site/cv.pdf")
