import Foundation
import Vision
import CoreImage
import ImageIO

// Generates masks only. Product pixels are never synthesised.
let input = URL(fileURLWithPath: CommandLine.arguments[1])
let output = URL(fileURLWithPath: CommandLine.arguments[2])
let handler = VNImageRequestHandler(url: input, options: [:])
let request = VNGenerateForegroundInstanceMaskRequest()
try handler.perform([request])
guard let observation = request.results?.first else { fatalError("No foreground") }
let buffer = try observation.generateScaledMaskForImage(forInstances: observation.allInstances, from: handler)
let mask = CIImage(cvPixelBuffer: buffer)
let context = CIContext()
try context.writePNGRepresentation(of: mask, to: output, format: .RGBA8, colorSpace: CGColorSpaceCreateDeviceRGB())
print("Mask: \(input.lastPathComponent), instances: \(observation.allInstances)")
