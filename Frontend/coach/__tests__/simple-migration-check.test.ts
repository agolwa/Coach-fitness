/**
 * Simple Migration Check Tests
 * Verify screen migrations were successful by checking file content
 */

import fs from 'fs';
import path from 'path';

describe('Screen Migration Check', () => {
  const screenFiles = [
    '../app/(tabs)/index.tsx',
    '../app/(tabs)/activity.tsx', 
    '../app/(tabs)/profile.tsx'
  ];

  describe('Migration Markers', () => {
    it.each(screenFiles)('should have MIGRATED marker in %s', (filePath) => {
      const fullPath = path.join(__dirname, filePath);
      const content = fs.readFileSync(fullPath, 'utf8');
      expect(content).toContain('MIGRATED ✅');
    });
  });

  describe('Import Updates', () => {
    it('should have updated index.tsx imports', () => {
      const content = fs.readFileSync(path.join(__dirname, '../app/(tabs)/index.tsx'), 'utf8');
      expect(content).not.toContain("import { useTheme } from '@/hooks/use-theme'");
      expect(content).toContain('useUnifiedColors');
    });

    it('should have updated activity.tsx imports', () => {
      const content = fs.readFileSync(path.join(__dirname, '../app/(tabs)/activity.tsx'), 'utf8');
      expect(content).not.toContain("import { useTheme } from '@/hooks/use-theme'");
      expect(content).toContain('useUnifiedColors');
    });

    it('should have updated profile.tsx imports', () => {
      const content = fs.readFileSync(path.join(__dirname, '../app/(tabs)/profile.tsx'), 'utf8');
      expect(content).not.toContain("import { useTheme } from '@/hooks/use-theme'");
      expect(content).toContain('useUnifiedTheme');
    });
  });

  describe('Color Token Updates', () => {
    it('should use unified color tokens in index.tsx', () => {
      const content = fs.readFileSync(path.join(__dirname, '../app/(tabs)/index.tsx'), 'utf8');
      expect(content).toContain('colors.tokens.foreground');
      expect(content).toContain('colors.tokens.mutedForeground');
      expect(content).toContain('colors.tokens.primaryForeground');
      expect(content).not.toContain("color: '#000000'"); // Removed hardcoded color
    });

    it('should use unified color tokens in activity.tsx', () => {
      const content = fs.readFileSync(path.join(__dirname, '../app/(tabs)/activity.tsx'), 'utf8');
      expect(content).toContain('colors.tokens.primary');
      expect(content).toContain('colors.tokens.mutedForeground');
      expect(content).toContain('colors.tokens.primaryMuted');
      expect(content).toContain('colors.tokens.primaryHover');
    });

    it('should use unified color tokens in profile.tsx', () => {
      const content = fs.readFileSync(path.join(__dirname, '../app/(tabs)/profile.tsx'), 'utf8');
      expect(content).toContain('colors.tokens.background');
      expect(content).toContain('colors.tokens.mutedBackground');
      expect(content).not.toContain('#ffffff'); // Should be replaced with tokens
      expect(content).not.toContain('#f4f4f5'); // Should be replaced with tokens
    });
  });

  describe('Hook Usage Updates', () => {
    it('should use useUnifiedColors in index.tsx', () => {
      const content = fs.readFileSync(path.join(__dirname, '../app/(tabs)/index.tsx'), 'utf8');
      expect(content).toContain('const colors = useUnifiedColors();');
    });

    it('should use useUnifiedColors in activity.tsx', () => {
      const content = fs.readFileSync(path.join(__dirname, '../app/(tabs)/activity.tsx'), 'utf8');
      expect(content).toContain('const colors = useUnifiedColors();');
    });

    it('should use useUnifiedTheme in profile.tsx', () => {
      const content = fs.readFileSync(path.join(__dirname, '../app/(tabs)/profile.tsx'), 'utf8');
      expect(content).toContain('const { colorScheme, toggleColorScheme } = useUnifiedTheme();');
      expect(content).toContain('const colors = useUnifiedColors();');
    });
  });

  describe('Legacy Code Removal', () => {
    it('should not contain theme.colors references in actual code', () => {
      screenFiles.forEach(filePath => {
        const content = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
        // Remove comment blocks to check actual code only
        const codeOnly = content.replace(/\/\*\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
        expect(codeOnly).not.toContain('theme.colors');
      });
    });

    it('should not contain const colors = theme.colors', () => {
      screenFiles.forEach(filePath => {
        const content = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
        expect(content).not.toContain('const colors = theme.colors');
      });
    });

    it('should not contain colors.primary.DEFAULT format', () => {
      screenFiles.forEach(filePath => {
        const content = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
        expect(content).not.toContain('colors.primary.DEFAULT');
        expect(content).not.toContain('colors.muted.foreground');
      });
    });
  });

  describe('Migration Notes', () => {
    it.each(screenFiles)('should have detailed migration notes in %s', (filePath) => {
      const content = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
      expect(content).toContain('MIGRATION NOTES:');
      expect(content).toContain('unified');
    });
  });
});