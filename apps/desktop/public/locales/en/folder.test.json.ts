import { describe, expect, it } from "vitest";
import folderLocale from "./folder.json";

describe("Folder Locale JSON", () => {
  describe("Structure validation", () => {
    it("should have valid JSON structure", () => {
      expect(folderLocale).toBeDefined();
      expect(typeof folderLocale).toBe("object");
    });

    it("should have createDialog section", () => {
      expect(folderLocale.createDialog).toBeDefined();
      expect(typeof folderLocale.createDialog).toBe("object");
    });

    it("should have preview section", () => {
      expect(folderLocale.preview).toBeDefined();
      expect(typeof folderLocale.preview).toBe("object");
    });
  });

  describe("Size estimation translations", () => {
    it("should have size section in createDialog", () => {
      expect(folderLocale.createDialog.size).toBeDefined();
      expect(typeof folderLocale.createDialog.size).toBe("object");
    });

    it("should have all required size translation keys", () => {
      const requiredKeys = [
        "title",
        "description",
        "button",
        "running",
        "starting",
        "error",
        "included",
        "excluded",
      ];

      requiredKeys.forEach((key) => {
        expect(folderLocale.createDialog.size).toHaveProperty(key);
        expect(typeof folderLocale.createDialog.size[key]).toBe("string");
        expect(folderLocale.createDialog.size[key].length).toBeGreaterThan(0);
      });
    });

    it("should have meaningful title text", () => {
      expect(folderLocale.createDialog.size.title).toBe("Calculate folder size");
      expect(folderLocale.createDialog.size.title.length).toBeGreaterThan(5);
    });

    it("should have meaningful description text", () => {
      expect(folderLocale.createDialog.size.description).toBe(
        "Estimate the size of this folder.",
      );
      expect(folderLocale.createDialog.size.description.length).toBeGreaterThan(
        10,
      );
    });

    it("should have action button text", () => {
      expect(folderLocale.createDialog.size.button).toBe("Calculate");
      expect(folderLocale.createDialog.size.button.length).toBeGreaterThan(3);
    });

    it("should have running state text", () => {
      expect(folderLocale.createDialog.size.running).toBe(
        "Analyzing folder...",
      );
      expect(folderLocale.createDialog.size.running).toContain("...");
    });

    it("should have starting state text", () => {
      expect(folderLocale.createDialog.size.starting).toBe(
        "Starting estimation...",
      );
      expect(folderLocale.createDialog.size.starting).toContain("...");
    });

    it("should have error message text", () => {
      expect(folderLocale.createDialog.size.error).toBe(
        "Failed to estimate folder size",
      );
      expect(folderLocale.createDialog.size.error).toContain("Failed");
    });

    it("should have included files label", () => {
      expect(folderLocale.createDialog.size.included).toBe("Included files:");
      expect(folderLocale.createDialog.size.included).toContain(":");
    });

    it("should have excluded files label", () => {
      expect(folderLocale.createDialog.size.excluded).toBe("Excluded files:");
      expect(folderLocale.createDialog.size.excluded).toContain(":");
    });
  });

  describe("Exceeding alert translations", () => {
    it("should have exceeding section", () => {
      expect(folderLocale.createDialog.exceeding).toBeDefined();
    });

    it("should have exceeding alert properties", () => {
      const exceeding = folderLocale.createDialog.exceeding;
      expect(exceeding).toHaveProperty("title");
      expect(exceeding).toHaveProperty("description");
      expect(exceeding).toHaveProperty("continue");
      expect(exceeding).toHaveProperty("upgrade");
    });

    it("should have non-empty exceeding text", () => {
      const exceeding = folderLocale.createDialog.exceeding;
      expect(exceeding.title.length).toBeGreaterThan(0);
      expect(exceeding.description.length).toBeGreaterThan(0);
      expect(exceeding.continue.length).toBeGreaterThan(0);
      expect(exceeding.upgrade.length).toBeGreaterThan(0);
    });
  });

  describe("Text quality", () => {
    it("should not have placeholder text", () => {
      const sizeSection = folderLocale.createDialog.size;
      const values = Object.values(sizeSection);

      values.forEach((value) => {
        expect(value.toLowerCase()).not.toContain("todo");
        expect(value.toLowerCase()).not.toContain("fixme");
        expect(value.toLowerCase()).not.toContain("xxx");
        expect(value).not.toMatch(/\{\{.*\}\}/); // No template literals
      });
    });

    it("should have proper capitalization", () => {
      const sizeSection = folderLocale.createDialog.size;

      // Title and button should start with capital letter
      expect(sizeSection.title[0]).toMatch(/[A-Z]/);
      expect(sizeSection.button[0]).toMatch(/[A-Z]/);
      expect(sizeSection.description[0]).toMatch(/[A-Z]/);
    });

    it("should have consistent punctuation for labels", () => {
      const sizeSection = folderLocale.createDialog.size;

      // Labels should end with colon
      expect(sizeSection.included).toMatch(/:$/);
      expect(sizeSection.excluded).toMatch(/:$/);
    });

    it("should have consistent ellipsis for loading states", () => {
      const sizeSection = folderLocale.createDialog.size;

      // Loading states should have ellipsis
      expect(sizeSection.running).toMatch(/\.\.\.$/);
      expect(sizeSection.starting).toMatch(/\.\.\.$/);
    });

    it("should not have trailing spaces", () => {
      const sizeSection = folderLocale.createDialog.size;
      const values = Object.values(sizeSection);

      values.forEach((value) => {
        expect(value).not.toMatch(/\s$/);
        expect(value).not.toMatch(/^\s/);
      });
    });

    it("should not have double spaces", () => {
      const sizeSection = folderLocale.createDialog.size;
      const values = Object.values(sizeSection);

      values.forEach((value) => {
        expect(value).not.toContain("  ");
      });
    });
  });

  describe("Completeness", () => {
    it("should have all translation keys used in the component", () => {
      // These keys are referenced in the component via t() function
      const requiredKeys = [
        "size.title",
        "size.description",
        "size.button",
        "size.running",
        "size.starting",
        "size.error",
        "size.included",
        "size.excluded",
      ];

      requiredKeys.forEach((keyPath) => {
        const [section, key] = keyPath.split(".");
        expect(folderLocale.createDialog[section]).toHaveProperty(key);
      });
    });
  });

  describe("Accessibility", () => {
    it("should have descriptive error messages", () => {
      const errorMessage = folderLocale.createDialog.size.error;
      expect(errorMessage.length).toBeGreaterThan(20);
      expect(errorMessage).toContain("estimate");
      expect(errorMessage).toContain("folder");
    });

    it("should have clear action button text", () => {
      const buttonText = folderLocale.createDialog.size.button;
      expect(buttonText.length).toBeGreaterThan(3);
      expect(buttonText.length).toBeLessThan(20);
    });

    it("should have informative loading messages", () => {
      const { running, starting } = folderLocale.createDialog.size;
      expect(running).toContain("folder");
      expect(starting).toContain("estimation");
    });
  });

  describe("Consistency with existing translations", () => {
    it("should follow existing naming patterns", () => {
      // Check that the new size section follows similar structure to existing sections
      const sizeKeys = Object.keys(folderLocale.createDialog.size);
      expect(sizeKeys).toContain("title");
      expect(sizeKeys).toContain("description");

      // Should use lowercase keys like other sections
      sizeKeys.forEach((key) => {
        expect(key[0]).toMatch(/[a-z]/);
      });
    });

    it("should be properly nested under createDialog", () => {
      expect(folderLocale.createDialog.size).toBeDefined();
      // Size section should be at the same level as exceeding
      expect(Object.keys(folderLocale.createDialog)).toContain("size");
      expect(Object.keys(folderLocale.createDialog)).toContain("exceeding");
    });
  });

  describe("JSON format validation", () => {
    it("should be valid JSON when stringified and parsed", () => {
      const stringified = JSON.stringify(folderLocale);
      const parsed = JSON.parse(stringified);
      expect(parsed).toEqual(folderLocale);
    });

    it("should not contain undefined values", () => {
      const checkForUndefined = (obj: any): boolean => {
        for (const key in obj) {
          if (obj[key] === undefined) return true;
          if (typeof obj[key] === "object" && checkForUndefined(obj[key]))
            return true;
        }
        return false;
      };

      expect(checkForUndefined(folderLocale)).toBe(false);
    });

    it("should have string values for all leaf nodes", () => {
      const sizeSection = folderLocale.createDialog.size;
      Object.values(sizeSection).forEach((value) => {
        expect(typeof value).toBe("string");
      });
    });
  });
});