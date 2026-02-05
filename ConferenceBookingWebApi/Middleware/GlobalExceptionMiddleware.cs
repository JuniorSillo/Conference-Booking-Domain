using ConferenceBookingWebApi.DTOs.Responses;
using Microsoft.AspNetCore.Http;
using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using ConferenceBooking.Domain.Exceptions;


namespace ConferenceBookingWebApi.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;

    public GlobalExceptionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new ErrorResponseDto
        {
            ErrorCategory = "UnexpectedError",
            ErrorCode = "ServerError",
            Message = "An unexpected error occurred. Please try again later."
        };

        HttpStatusCode statusCode = HttpStatusCode.InternalServerError;

        // ────────────────────────────────────────────────
        // Client-responsible failures (actionable messages)
        // ────────────────────────────────────────────────
        if (exception is InvalidBookingTimeException)
        {
            statusCode = HttpStatusCode.BadRequest;
            response.ErrorCategory = "ClientValidation";
            response.ErrorCode = "InvalidTimeRange";
            response.Message = exception.Message; // e.g. "End time must be after start time."
            response.Details = "Please check the start and end times.";
        }
        else if (exception is RoomNotFoundException)
        {
            statusCode = HttpStatusCode.BadRequest;
            response.ErrorCategory = "ClientInput";
            response.ErrorCode = "RoomNotFound";
            response.Message = exception.Message;
            response.Details = "Verify the RoomID and try again.";
        }
        else if (exception is ArgumentException argEx)
        {
            statusCode = HttpStatusCode.BadRequest;
            response.ErrorCategory = "ClientValidation";
            response.ErrorCode = "InvalidArgument";
            response.Message = argEx.Message;
            response.Details = "Check your request payload for missing or incorrect values.";
        }

        // ────────────────────────────────────────────────
        // Server / infrastructure failures (generic messages)
        // ────────────────────────────────────────────────
        else if (exception is BookingConflictException)
        {
            statusCode = HttpStatusCode.Conflict;
            response.ErrorCategory = "BusinessRuleViolation";
            response.ErrorCode = "TimeSlotConflict";
            response.Message = "The requested time slot is already booked."; // generic
            // No details → don't leak which booking caused conflict
        }
        else if (exception is InvalidOperationException)
        {
            statusCode = HttpStatusCode.Conflict;
            response.ErrorCategory = "BusinessRuleViolation";
            response.ErrorCode = "InvalidState";
            response.Message = "The operation cannot be performed in the current state.";
        }

        // ────────────────────────────────────────────────
        // Unexpected / infrastructure failures (generic)
        // ────────────────────────────────────────────────
        else
        {
            // Keep generic – never expose stack trace or internal details
            response.ErrorCategory = "UnexpectedError";
            response.Message = "An unexpected error occurred on our side.";
        }

        // ────────────────────────────────────────────────
        // Improved logging (structured, no sensitive data)
        // ────────────────────────────────────────────────
        Console.WriteLine("───────────────────────────────────────────────");
        Console.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss UTC}] UNHANDLED EXCEPTION");
        Console.WriteLine($"Category: {response.ErrorCategory}");
        Console.WriteLine($"Code: {response.ErrorCode}");
        Console.WriteLine($"Status: {(int)statusCode}");
        Console.WriteLine($"Path: {context.Request.Path}");
        Console.WriteLine($"Method: {context.Request.Method}");
        Console.WriteLine($"Exception Type: {exception.GetType().Name}");
        Console.WriteLine($"Message: {exception.Message}");
        Console.WriteLine($"StackTrace: {exception.StackTrace?.Replace("\r\n", " | ")}"); // single line
        Console.WriteLine("───────────────────────────────────────────────");

        context.Response.StatusCode = (int)statusCode;

        var result = JsonSerializer.Serialize(response, new JsonSerializerOptions { WriteIndented = true });
        return context.Response.WriteAsync(result);
    }
}