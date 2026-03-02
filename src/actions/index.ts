import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { Resend } from 'resend';

// Only create a Resend instance if an API key is provided
const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const server = {
    sendContactRequest: defineAction({
        accept: 'form',
        input: z.object({
            name: z.string().min(1, "Please enter your full name"),
            email: z.string().email("Please enter a valid email address"),
            phone: z.string().optional(),
            program: z.string().optional(),
            message: z.string().min(10, "Your message is a bit too short. Please tell us a little more!")
        }),
        handler: async (input) => {
            if (!import.meta.env.RESEND_API_KEY) {
                throw new Error("RESEND_API_KEY is not defined in the environment variables.");
            }

            const { name, email, phone, program, message } = input;

            const { data, error } = await resend.emails.send({
                from: 'Creative Learners <onboarding@resend.dev>', // Resend default for testing, user should update this for production
                to: ['cpbeltran16@gmail.com'], // User should verify this or put their desired recipient here
                subject: `New Contact Form Submission from ${name}`,
                html: `
          <h1>New Contact Request</h1>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Program:</strong> ${program || 'Not specified'}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
            });

            if (error) {
                throw new Error(`Failed to send email: ${error.message}`);
            }

            return {
                success: true,
                data,
            };
        },
    }),
};
