const std = @import("std");
const c = @cImport({
    // @cDefine("LZ4_FREESTANDING", "1");
    // @cDefine("LZ4_USER_MEMORY_FUNCTIONS", "1");
    // @cDefine("LZ4_malloc", "LZ4_malloc");
    // @cDefine("LZ4_free", "LZ4_free");
    // @cDefine("LZ4_memcpy", "LZ4_memcpy");
    // @cDefine("LZ4_memset", "LZ4_memset");
    // @cDefine("LZ4_memmove", "LZ4_memmove");
    // @cDefine("LZ4LIB_VISIBILITY", {});
    @cInclude("lz4.h");
});

const allocator = std.heap.page_allocator;

pub export fn malloc(length: usize) ?[*]u8 {
    const buff = allocator.alloc(u8, length) catch return null;
    return buff.ptr;
}

pub export fn calloc(nmemb: usize, size: usize) ?[*]u8 {
    const total_size = nmemb *% size;
    if (total_size == 0) return null;
    const ptr = malloc(total_size) orelse return null;
    const dest_slice = ptr[0..total_size];
    @memset(dest_slice, 0);
    return ptr;
}

pub export fn free(_: [*]u8) void {}

extern fn LZ4_compress_default(src: [*c]const u8, dst: [*c]u8, srcSize: c_int, dstCapacity: c_int) c_int;
pub export fn compress(input_ptr: *const u8, input_size: usize, output_ptr: *u8, output_size: usize) usize {
    const compressed_size = LZ4_compress_default(input_ptr, output_ptr, @intCast(input_size), @intCast(output_size));
    return @intCast(compressed_size);
}

extern fn LZ4_decompress_safe(src: [*c]const u8, dst: [*c]u8, compressedSize: c_int, dstCapacity: c_int) c_int;
pub export fn decompress(input_ptr: *const u8, input_size: usize, output_ptr: *u8, output_size: usize) usize {
    const decompressed_size = LZ4_decompress_safe(input_ptr, output_ptr, @intCast(input_size), @intCast(output_size));
    return @intCast(decompressed_size);
}
