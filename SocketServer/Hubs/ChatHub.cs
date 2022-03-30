using System.Threading.Tasks;
using SocketServer.Models;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Channels;

namespace SocketServer.Hubs

{
    public interface IChatClient
    {
        Task ReceiveMessage(ChatMessage message);
    }
    public class ChatHub : Hub<IChatClient>
    {
        public async Task SendMessage(ChatMessage message)
        {
            //  await Clients.All.SendAsync("ReceiveMessage", message); - normal
            await Clients.All.ReceiveMessage(message); // strongly typed
        }

        public ChannelReader<int> Counter(
    int count,
    int delay,
    CancellationToken cancellationToken)
        {
            var channel = Channel.CreateUnbounded<int>();

            _ = WriteItemsAsync(channel.Writer, count, delay, cancellationToken);

            return channel.Reader;
        }

        private async Task WriteItemsAsync(
            ChannelWriter<int> writer,
            int count,
            int delay,
            CancellationToken cancellationToken)
        {
            Exception localException = null;
            try
            {
                for (var i = 0; i < count; i++)
                {
                    await writer.WriteAsync(i, cancellationToken);

                    await Task.Delay(delay, cancellationToken);
                }
            }
            catch (Exception ex)
            {

                localException = ex;
            }
            finally
            {
                writer.Complete(localException);
            }
        }
    }
}