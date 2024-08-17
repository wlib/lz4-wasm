const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{
        .default_target = .{
            .cpu_arch = .wasm32,
            .os_tag = .freestanding,
        },
    });
    const optimize = b.standardOptimizeOption(.{ .preferred_optimize_mode = .ReleaseFast });

    // .export_symbol_names = &.{"malloc", "calloc", "free", "compress", "decompress"},

    const lz4 = b.addExecutable(.{
        .name = "lz4",
        .root_source_file = b.path("./src/lz4.zig"),
        .target = target,
        .optimize = optimize,
    });
    lz4.addIncludePath(b.path("./lz4/lib"));
    lz4.addCSourceFile(.{
        .file = b.path("./lz4/lib/lz4.c"),
        //.flags = &.{ "-DLZ4_FREESTANDING=1", "-DLZ4_USER_MEMORY_FUNCTIONS=1", "-DLZ4_malloc=LZ4_malloc", "-DLZ4_free=LZ4_free", "-DLZ4_memcpy=LZ4_memcpy", "-DLZ4_memset=LZ4_memset", "-DLZ4_memmove=LZ4_memmove" }
    });
    lz4.rdynamic = true;
    lz4.entry = .disabled;
    lz4.linkLibC();

    b.installArtifact(lz4);
}
