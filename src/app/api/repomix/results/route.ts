import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { XMLParser, XMLValidator } from 'fast-xml-parser';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const xmlPath = searchParams.get('path');

  if (!xmlPath) {
    return NextResponse.json({ error: 'Missing path query parameter' }, { status: 400 });
  }

  // Basic security check: ensure the path is within the expected storage directory
  // This is crucial to prevent path traversal vulnerabilities.
  const storageDir = path.resolve(process.cwd(), 'storage', 'repos');
  const resolvedXmlPath = path.resolve(xmlPath); // Resolve the user-provided path

  if (!resolvedXmlPath.startsWith(storageDir)) {
      console.error(`Attempt to access file outside storage directory: ${resolvedXmlPath}`);
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }
  // Ensure the path ends with .xml
  if (!resolvedXmlPath.endsWith('repomix-output.xml')) {
      console.error(`Attempt to access non-XML file: ${resolvedXmlPath}`);
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  try {
    // Read the XML file content
    const xmlContent = await fs.readFile(resolvedXmlPath, 'utf-8');

    // Validate the XML (optional but recommended)
    const validationResult = XMLValidator.validate(xmlContent);
    if (validationResult !== true) {
        console.error(`Invalid XML format in ${resolvedXmlPath}:`, validationResult.err);
        return NextResponse.json({ error: 'Invalid XML format in analysis results', details: validationResult.err }, { status: 500 });
    }

    // Parse the XML content into JSON
    // Configure parser options as needed (e.g., ignoreAttributes, attributeNamePrefix)
    const parser = new XMLParser({ 
        ignoreAttributes: false, // Keep attributes if repomix uses them
        attributeNamePrefix : "@_", // Standard prefix for attributes
        allowBooleanAttributes: true,
        parseAttributeValue: true,
        parseTagValue: true
    });
    const jsonData = parser.parse(xmlContent);

    // For now, return the parsed JSON data.
    // You might want to transform or extract specific parts later.
    return NextResponse.json(jsonData);

  } catch (error: any) {
    if (error.code === 'ENOENT') {
        console.error(`Repomix output file not found: ${resolvedXmlPath}`);
        return NextResponse.json({ error: 'Repomix output file not found' }, { status: 404 });
    }
    console.error(`Error reading or parsing repomix results from ${resolvedXmlPath}:`, error);
    return NextResponse.json({ error: 'Failed to process repomix results' }, { status: 500 });
  }
} 