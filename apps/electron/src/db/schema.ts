import type { BaseItem, CollectionOptions } from "@signaldb/core";
import { Collection } from "@signaldb/core";
import type { infer as ZodInfer, ZodType } from "zod";

interface SchemaCollectionOptions<
  T extends ZodType<BaseItem<I>>,
  I,
  U extends BaseItem = ZodInfer<T>,
> extends CollectionOptions<ZodInfer<T>, I, U> {
  schema: T;
}

export class SchemaCollection<
  T extends ZodType<BaseItem<I>>,
  // eslint-disable-next-line
  I = any,
  U extends BaseItem = ZodInfer<T>,
> extends Collection<ZodInfer<T>, I, U> {
  private schema: T;

  constructor(options: SchemaCollectionOptions<T, I, U>) {
    super(options);
    this.schema = options.schema;

    // Automatically validate each item against the Zod schema before saving
    this.on("validate", (item) => {
      this.schema.parse(item);
    });
  }
}
