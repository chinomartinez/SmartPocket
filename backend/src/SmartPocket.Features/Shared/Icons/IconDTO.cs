using SmartPocket.Domain;

namespace SmartPocket.Features.Shared.Icons
{
    public class IconDTO
    {
        public string Code { get; set; } = default!;
        public string ColorHex { get; set; } = default!;

        /// <summary>
        /// Mapea DTO a entidad de dominio <see cref="Icon"/>
        /// </summary>
        /// <returns></returns>
        public Icon ToDomainIcon()
        {
            return new Icon(Code, ColorHex);
        }
    }
}
